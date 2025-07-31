<?php
namespace WPAM\Includes;

use WPAM\Includes\WPAM_Auction_State;

class WPAM_Bid {
    protected $realtime_provider;

    public function __construct() {
        add_action( 'wp_ajax_wpam_place_bid', [ $this, 'place_bid' ] );
        add_action( 'wp_ajax_nopriv_wpam_place_bid', [ $this, 'place_bid' ] );

        add_action( 'init', [ $this, 'add_account_endpoints' ] );
        add_filter( 'woocommerce_account_menu_items', [ $this, 'add_account_menu_items' ] );
        add_action( 'woocommerce_account_my-bids_endpoint', [ $this, 'render_my_bids_page' ] );
        add_action( 'woocommerce_account_auctions-won_endpoint', [ $this, 'render_auctions_won_page' ] );

        add_action( 'wp_ajax_wpam_get_highest_bid', [ $this, 'get_highest_bid' ] );
        add_action( 'wp_ajax_nopriv_wpam_get_highest_bid', [ $this, 'get_highest_bid' ] );

        $provider = get_option( 'wpam_realtime_provider', 'none' );
        if ( 'pusher' === $provider && class_exists( 'WPAM_Pusher_Provider' ) ) {
            $this->realtime_provider = new WPAM_Pusher_Provider();
        }

    }

    private static function proxy_enabled( $auction_id ) {
        return get_option( 'wpam_enable_proxy_bidding' ) && get_post_meta( $auction_id, '_auction_proxy_bidding', true );
    }

    private static function silent_enabled( $auction_id ) {
        return get_option( 'wpam_enable_silent_bidding' ) && get_post_meta( $auction_id, '_auction_silent_bidding', true );
    }

    private static function is_reverse( $auction_id ) {
        return 'reverse' === get_post_meta( $auction_id, '_auction_type', true );
    }

    private static function is_sealed( $auction_id ) {
        return 'sealed' === get_post_meta( $auction_id, '_auction_type', true );
    }

    private static function log_bid( $bid_id, $user_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_audit';
        $wpdb->insert(
            $table,
            [
                'bid_id'     => $bid_id,
                'user_id'    => $user_id,
                'ip'         => isset( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : '',
                'user_agent' => isset( $_SERVER['HTTP_USER_AGENT'] ) ? $_SERVER['HTTP_USER_AGENT'] : '',
                'logged_at'  => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
            ],
            [ '%d', '%d', '%s', '%s', '%s' ]
        );

        if ( class_exists( '\\WPAM\\Includes\\WPAM_Fraud_Detector' ) ) {
            \WPAM\Includes\WPAM_Fraud_Detector::analyze_bid( $bid_id, $user_id );
        }
    }

    /**
     * Determine the bidding status for all users after a bid is placed.
     *
     * @param int   $auction_id Auction ID.
     * @param float $highest    Current highest bid.
     * @param int   $lead_user  Current lead user ID.
     * @param bool  $reverse    Whether this is a reverse auction.
     * @return array            Map of user_id => status.
     */
    private static function calculate_statuses( $auction_id, $highest, $lead_user, $reverse ) {
        global $wpdb;

        if ( self::is_sealed( $auction_id ) || self::silent_enabled( $auction_id ) ) {
            $end   = get_post_meta( $auction_id, '_auction_end', true );
            $end_ts = $end ? ( new \DateTimeImmutable( $end, wp_timezone() ) )->getTimestamp() : 0;
            if ( ( new \DateTimeImmutable( 'now', wp_timezone() ) )->getTimestamp() < $end_ts ) {
                return [];
            }
        }

        $table = $wpdb->prefix . 'wc_auction_bids';
        $order = $reverse ? 'ASC' : 'DESC';
        $rows  = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC",
                $auction_id
            )
        );

        $statuses = [];
        $seen     = [];
        foreach ( $rows as $row ) {
            $uid = intval( $row->user_id );
            if ( isset( $seen[ $uid ] ) ) {
                continue;
            }
            $bid = floatval( $row->bid_amount );
            if ( $uid === $lead_user ) {
                $statuses[ $uid ] = 'max';
            } elseif ( ( ! $reverse && $bid === $highest ) || ( $reverse && $bid === $highest ) ) {
                $statuses[ $uid ] = 'winning';
            } else {
                $statuses[ $uid ] = 'outbid';
            }
            $seen[ $uid ] = true;
        }

        return $statuses;
    }

    public function place_bid() {
        check_ajax_referer( 'wpam_place_bid', 'nonce' );

        if ( empty( $_POST['auction_id'] ) || empty( $_POST['bid'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid bid data', 'wpam' ) ] );
        }

        $auction_id = absint( $_POST['auction_id'] );
        $bid        = floatval( $_POST['bid'] );
        $user_id    = get_current_user_id();

        if ( 0 === $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please login', 'wpam' ) ] );
        }

        if ( get_option( 'wpam_require_kyc' ) && ! get_user_meta( $user_id, 'wpam_kyc_verified', true ) ) {
            wp_send_json_error( [ 'message' => __( 'Verification required', 'wpam' ) ] );
        }

        $start = get_post_meta( $auction_id, '_auction_start', true );
        $end   = get_post_meta( $auction_id, '_auction_end', true );

        $timezone = wp_timezone();
        $start_ts = $start ? ( new \DateTimeImmutable( $start, $timezone ) )->getTimestamp() : 0;
        $end_ts   = $end ? ( new \DateTimeImmutable( $end, $timezone ) )->getTimestamp() : 0;

        $now = ( new \DateTimeImmutable( 'now', $timezone ) )->getTimestamp();

        if ( $now < $start_ts || $now > $end_ts ) {
            wp_send_json_error( [ 'message' => __( 'Auction not active', 'wpam' ) ] );
        }

        global $wpdb;
        $table  = $wpdb->prefix . 'wc_auction_bids';
        $reverse = self::is_reverse( $auction_id );
        $sealed  = self::is_sealed( $auction_id );

        $order        = $reverse ? 'ASC' : 'DESC';
        $highest_row  = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1", $auction_id ), ARRAY_A );
        $highest      = $highest_row ? floatval( $highest_row['bid_amount'] ) : 0;
        $highest_user = $highest_row ? intval( $highest_row['user_id'] ) : 0;

        $prev_highest_user = $highest_user;

        $prev_lead_user = intval( get_post_meta( $auction_id, '_auction_lead_user', true ) );
        $prev_lead_max  = 0;
        if ( $prev_lead_user ) {
            $prev_lead_max = get_user_meta( $prev_lead_user, 'wpam_proxy_max_' . $auction_id, true );
            $prev_lead_max = $prev_lead_max ? floatval( $prev_lead_max ) : $highest;
        } else {
            $prev_lead_max = $highest;
        }

        $proxy_enabled  = $reverse ? false : self::proxy_enabled( $auction_id );
        $silent_enabled = $sealed ? true : self::silent_enabled( $auction_id );
        $max_bid        = isset( $_POST['max_bid'] ) ? floatval( $_POST['max_bid'] ) : $bid;
        if ( $max_bid < $bid ) {
            $max_bid = $bid;
        }

        $new_lead_user = $prev_lead_user;
        if ( $max_bid > $prev_lead_max ) {
            $new_lead_user = $user_id;
        }

        $max_bids = intval( get_post_meta( $auction_id, '_auction_max_bids', true ) );
        if ( $max_bids > 0 ) {
            $count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE auction_id = %d AND user_id = %d", $auction_id, $user_id ) );
            if ( $count >= $max_bids ) {
                wp_send_json_error( [ 'message' => __( 'Bid limit reached', 'wpam' ) ] );
            }
        }

        if ( $sealed ) {
            $placed = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE auction_id = %d AND user_id = %d", $auction_id, $user_id ) );
            if ( $placed > 0 ) {
                wp_send_json_error( [ 'message' => __( 'Only one bid allowed for sealed auctions', 'wpam' ) ] );
            }
        }

        $increment = WPAM_Auction::get_bid_increment( $auction_id, $highest );

        if ( ! $proxy_enabled ) {
            if ( $reverse ) {
                if ( $highest_row && $bid > $highest - $increment ) {
                    wp_send_json_error( [ 'message' => __( 'Bid too high', 'wpam' ) ] );
                }
            } else {
                if ( $bid < $highest + $increment ) {
                    wp_send_json_error( [ 'message' => __( 'Bid too low', 'wpam' ) ] );
                }
            }

            $wpdb->insert(
                $table,
                [
                    'auction_id' => $auction_id,
                    'user_id'    => $user_id,
                    'bid_amount' => $bid,
                    'bid_time'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                ],
                [ '%d', '%d', '%f', '%s' ]
            );
            self::log_bid( $wpdb->insert_id, $user_id );

            do_action( 'wpam_bid_placed', $auction_id, $user_id, $bid );
        } else {
            if ( $max_bid < $highest + $increment ) {
                wp_send_json_error( [ 'message' => __( 'Bid too low', 'wpam' ) ] );
            }

            $place_bid = ( $highest > 0 ) ? min( $max_bid, $highest + $increment ) : $max_bid;
            $wpdb->insert(
                $table,
                [
                    'auction_id' => $auction_id,
                    'user_id'    => $user_id,
                    'bid_amount' => $place_bid,
                    'bid_time'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                ],
                [ '%d', '%d', '%f', '%s' ]
            );
            self::log_bid( $wpdb->insert_id, $user_id );
            do_action( 'wpam_bid_placed', $auction_id, $user_id, $place_bid );
            update_user_meta( $user_id, 'wpam_proxy_max_' . $auction_id, $max_bid );

            $bid = $place_bid;

            if ( $highest_user && $highest_user !== $user_id ) {
                $prev_max = get_user_meta( $highest_user, 'wpam_proxy_max_' . $auction_id, true );
                $prev_max = $prev_max ? floatval( $prev_max ) : $highest;
                if ( $prev_max > $place_bid ) {
                    $auto_bid = min( $prev_max, $place_bid + $increment );
                    $wpdb->insert(
                        $table,
                        [
                            'auction_id' => $auction_id,
                            'user_id'    => $highest_user,
                            'bid_amount' => $auto_bid,
                            'bid_time'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                        ],
                        [ '%d', '%d', '%f', '%s' ]
                    );
                    self::log_bid( $wpdb->insert_id, $highest_user );
                    do_action( 'wpam_bid_placed', $auction_id, $highest_user, $auto_bid );
                    $bid = $auto_bid;
                } else {
                    $highest_user = $user_id;
                }
            } else {
                $highest_user = $user_id;
            }
        }


        // Extend auction end time if within soft close window
        $extended   = false;
        $new_end_ts = $end_ts;
        $threshold  = absint( get_option( 'wpam_soft_close_threshold', 0 ) );
        $extension  = absint( get_option( 'wpam_soft_close_extend', 0 ) );
        $legacy     = absint( get_option( 'wpam_soft_close', 0 ) ) * 60;

        if ( 0 === $threshold ) {
            $threshold = $legacy;
        }

        if ( 0 === $extension ) {
            $extension = $legacy;
        }

        $extension_count = (int) get_post_meta( $auction_id, '_auction_extension_count', true );
        $max_extensions  = absint( get_option( 'wpam_max_extensions', 0 ) );

        if ( $threshold > 0 && $end_ts - $now <= $threshold ) {
            if ( 0 === $max_extensions || $extension_count < $max_extensions ) {
                $new_end_ts = $end_ts + $extension;
                $new_end    = wp_date( 'Y-m-d H:i:s', $new_end_ts, wp_timezone() );
                update_post_meta( $auction_id, '_auction_end', $new_end );
                update_post_meta( $auction_id, '_auction_extension_count', $extension_count + 1 );
                wp_clear_scheduled_hook( 'wpam_auction_end', [ $auction_id ] );
                wp_schedule_single_event( (int) get_gmt_from_date( $new_end, 'U' ), 'wpam_auction_end', [ $auction_id ] );
                $extended = true;
            }
        }

        // Determine new highest bid after processing
        $new_highest_row  = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1", $auction_id ), ARRAY_A );
        $new_highest_user = $new_highest_row ? intval( $new_highest_row['user_id'] ) : 0;
        $new_highest      = $new_highest_row ? floatval( $new_highest_row['bid_amount'] ) : 0;
        if ( $new_lead_user !== $prev_lead_user ) {
            update_post_meta( $auction_id, '_auction_lead_user', $new_lead_user );
        }

        $statuses = self::calculate_statuses( $auction_id, $new_highest, $new_highest_user, $reverse );


        $max_reached = false;
        if ( $proxy_enabled && $max_bid <= $new_highest && $new_highest_user !== $user_id ) {
            $max_reached = true;
        }


        // Dispatch standardized events
        WPAM_Event_Bus::dispatch( 'bid_placed', [
            'auction_id' => $auction_id,
            'user_id'    => $user_id,
            'amount'     => $bid,
            'statuses'   => $statuses,
        ] );

        if ( ! $silent_enabled && $prev_lead_user && $prev_lead_user !== $new_lead_user ) {
            WPAM_Event_Bus::dispatch( 'user_outbid', [
                'auction_id' => $auction_id,
                'user_id'    => $prev_lead_user,
            ] );
        }

        if ( $max_reached ) {
            WPAM_Event_Bus::dispatch( 'max_exceeded', [
                'auction_id' => $auction_id,
                'user_id'    => $user_id,
            ] );
        }

        $message  = $sealed ? __( 'Sealed bid submitted', 'wpam' ) : __( 'Bid received', 'wpam' );
        if ( $max_reached ) {
            $message = __( 'Max bid reached', 'wpam' );
        }

        $response = [
            'message' => $message,
            'status'  => isset( $statuses[ $user_id ] ) ? $statuses[ $user_id ] : '',
            'statuses' => $statuses,
        ];
        if ( $extended ) {
            $response['new_end_ts'] = $new_end_ts;
            $response['extended']   = true;
            WPAM_Event_Bus::dispatch( 'auction_extended', [
                'auction_id' => $auction_id,
                'new_end_ts' => $new_end_ts,
            ] );
        }
        if ( $max_reached ) {
            $response['max_reached'] = true;
        }

        wp_send_json_success( $response );
    }

    /**
     * Return the current highest bid for an auction.
     */
    public function get_highest_bid() {
        check_ajax_referer( 'wpam_get_highest_bid', 'nonce' );

        if ( empty( $_REQUEST['auction_id'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid auction', 'wpam' ) ] );
        }

        $auction_id = absint( $_REQUEST['auction_id'] );

        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $reverse = self::is_reverse( $auction_id );
        $sealed  = self::is_sealed( $auction_id );

        $query   = $reverse ? "SELECT MIN(bid_amount) FROM $table WHERE auction_id = %d" : "SELECT MAX(bid_amount) FROM $table WHERE auction_id = %d";
        $highest = $wpdb->get_var( $wpdb->prepare( $query, $auction_id ) );
        $highest = $highest ? floatval( $highest ) : 0;
        $lead_user = intval( get_post_meta( $auction_id, '_auction_lead_user', true ) );

        $lead_user = intval( get_post_meta( $auction_id, '_auction_lead_user', true ) );

        if ( $sealed || self::silent_enabled( $auction_id ) ) {
            $end   = get_post_meta( $auction_id, '_auction_end', true );
            $end_ts = $end ? ( new \DateTimeImmutable( $end, wp_timezone() ) )->getTimestamp() : 0;
            if ( ( new \DateTimeImmutable( 'now', wp_timezone() ) )->getTimestamp() < $end_ts ) {
                $highest = 0;
                $lead_user = 0;
            }
        }

        $ending_reason = '';
        if ( WPAM_Auction_State::ENDED === get_post_meta( $auction_id, '_auction_state', true ) ) {
            $ending_reason = get_post_meta( $auction_id, '_auction_ending_reason', true );
        }

        $response = [ 'highest_bid' => $highest, 'lead_user' => $lead_user ];
        if ( $ending_reason ) {
            $response['ending_reason'] = $ending_reason;
        }

        wp_send_json_success( $response );
    }

    /**
     * REST endpoint to place a bid.
     */
    public static function rest_place_bid( \WP_REST_Request $request ) {
        $_POST = [];
        $auction_id = absint( $request['auction_id'] );
        $bid        = floatval( $request['bid'] );
        $max_bid    = $request->get_param( 'max_bid' );
        if ( null !== $max_bid ) {
            $max_bid = floatval( $max_bid );
        }

        // Reuse internal logic from place_bid without nonce check.
        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            return new \WP_Error( 'wpam_login', __( 'Please login', 'wpam' ), [ 'status' => 403 ] );
        }

        $start = get_post_meta( $auction_id, '_auction_start', true );
        $end   = get_post_meta( $auction_id, '_auction_end', true );
        $timezone = wp_timezone();
        $start_ts = $start ? ( new \DateTimeImmutable( $start, $timezone ) )->getTimestamp() : 0;
        $end_ts   = $end ? ( new \DateTimeImmutable( $end, $timezone ) )->getTimestamp() : 0;
        $now = ( new \DateTimeImmutable( 'now', $timezone ) )->getTimestamp();
        if ( $now < $start_ts || $now > $end_ts ) {
            return new \WP_Error( 'wpam_inactive', __( 'Auction not active', 'wpam' ), [ 'status' => 400 ] );
        }

        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $reverse = self::is_reverse( $auction_id );
        $sealed  = self::is_sealed( $auction_id );

        $order        = $reverse ? 'ASC' : 'DESC';
        $highest_row  = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1", $auction_id ), ARRAY_A );
        $highest      = $highest_row ? floatval( $highest_row['bid_amount'] ) : 0;
        $highest_user = $highest_row ? intval( $highest_row['user_id'] ) : 0;

        $prev_highest_user = $highest_user;

        $prev_lead_user = intval( get_post_meta( $auction_id, '_auction_lead_user', true ) );
        $prev_lead_max  = 0;
        if ( $prev_lead_user ) {
            $prev_lead_max = get_user_meta( $prev_lead_user, 'wpam_proxy_max_' . $auction_id, true );
            $prev_lead_max = $prev_lead_max ? floatval( $prev_lead_max ) : $highest;
        } else {
            $prev_lead_max = $highest;
        }

        $proxy_enabled  = $reverse ? false : self::proxy_enabled( $auction_id );
        $silent_enabled = $sealed ? true : self::silent_enabled( $auction_id );
        if ( null === $max_bid ) {
            $max_bid = $bid;
        }
        if ( $max_bid < $bid ) {
            $max_bid = $bid;
        }

        $max_bids = intval( get_post_meta( $auction_id, '_auction_max_bids', true ) );
        if ( $max_bids > 0 ) {
            $count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE auction_id = %d AND user_id = %d", $auction_id, $user_id ) );
            if ( $count >= $max_bids ) {
                return new \WP_Error( 'wpam_limit', __( 'Bid limit reached', 'wpam' ), [ 'status' => 400 ] );
            }
        }

        $increment = WPAM_Auction::get_bid_increment( $auction_id, $highest );

        if ( ! $proxy_enabled ) {
            if ( $reverse ) {
                if ( $highest_row && $bid > $highest - $increment ) {
                    return new \WP_Error( 'wpam_high', __( 'Bid too high', 'wpam' ), [ 'status' => 400 ] );
                }
            } else {
                if ( $bid < $highest + $increment ) {
                    return new \WP_Error( 'wpam_low', __( 'Bid too low', 'wpam' ), [ 'status' => 400 ] );
                }
            }

            $wpdb->insert(
                $table,
                [
                    'auction_id' => $auction_id,
                    'user_id'    => $user_id,
                    'bid_amount' => $bid,
                    'bid_time'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                ],
                [ '%d', '%d', '%f', '%s' ]
            );
            self::log_bid( $wpdb->insert_id, $user_id );

            do_action( 'wpam_bid_placed', $auction_id, $user_id, $bid );
        } else {
            if ( $max_bid < $highest + $increment ) {
                return new \WP_Error( 'wpam_low', __( 'Bid too low', 'wpam' ), [ 'status' => 400 ] );
            }

            $place_bid = ( $highest > 0 ) ? min( $max_bid, $highest + $increment ) : $max_bid;
            $wpdb->insert(
                $table,
                [
                    'auction_id' => $auction_id,
                    'user_id'    => $user_id,
                    'bid_amount' => $place_bid,
                    'bid_time'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                ],
                [ '%d', '%d', '%f', '%s' ]
            );
            self::log_bid( $wpdb->insert_id, $user_id );
            do_action( 'wpam_bid_placed', $auction_id, $user_id, $place_bid );
            update_user_meta( $user_id, 'wpam_proxy_max_' . $auction_id, $max_bid );

            $bid = $place_bid;

            if ( $highest_user && $highest_user !== $user_id ) {
                $prev_max = get_user_meta( $highest_user, 'wpam_proxy_max_' . $auction_id, true );
                $prev_max = $prev_max ? floatval( $prev_max ) : $highest;
                if ( $prev_max > $place_bid ) {
                    $auto_bid = min( $prev_max, $place_bid + $increment );
                    $wpdb->insert(
                        $table,
                        [
                            'auction_id' => $auction_id,
                            'user_id'    => $highest_user,
                            'bid_amount' => $auto_bid,
                            'bid_time'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                        ],
                        [ '%d', '%d', '%f', '%s' ]
                    );
                    self::log_bid( $wpdb->insert_id, $highest_user );
                    do_action( 'wpam_bid_placed', $auction_id, $highest_user, $auto_bid );
                    $bid = $auto_bid;
                } else {
                    $highest_user = $user_id;
                }
            } else {
                $highest_user = $user_id;
            }
        }

        $extended   = false;
        $new_end_ts = $end_ts;
        $threshold  = absint( get_option( 'wpam_soft_close_threshold', 0 ) );
        $extension  = absint( get_option( 'wpam_soft_close_extend', 0 ) );
        $legacy     = absint( get_option( 'wpam_soft_close', 0 ) ) * 60;

        if ( 0 === $threshold ) {
            $threshold = $legacy;
        }

        if ( 0 === $extension ) {
            $extension = $legacy;
        }

        $extension_count = (int) get_post_meta( $auction_id, '_auction_extension_count', true );
        $max_extensions  = absint( get_option( 'wpam_max_extensions', 0 ) );

        if ( $threshold > 0 && $end_ts - $now <= $threshold ) {
            if ( 0 === $max_extensions || $extension_count < $max_extensions ) {
                $new_end_ts = $end_ts + $extension;
                $new_end    = wp_date( 'Y-m-d H:i:s', $new_end_ts, wp_timezone() );
                update_post_meta( $auction_id, '_auction_end', $new_end );
                update_post_meta( $auction_id, '_auction_extension_count', $extension_count + 1 );
                wp_clear_scheduled_hook( 'wpam_auction_end', [ $auction_id ] );
                wp_schedule_single_event( (int) get_gmt_from_date( $new_end, 'U' ), 'wpam_auction_end', [ $auction_id ] );
                $extended = true;
            }
        }

        $new_highest_row  = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1", $auction_id ), ARRAY_A );
        $new_highest_user = $new_highest_row ? intval( $new_highest_row['user_id'] ) : 0;
        $new_highest      = $new_highest_row ? floatval( $new_highest_row['bid_amount'] ) : 0;
        if ( $new_lead_user !== $prev_lead_user ) {
            update_post_meta( $auction_id, '_auction_lead_user', $new_lead_user );
        }

        $statuses = self::calculate_statuses( $auction_id, $new_highest, $new_highest_user, $reverse );

        WPAM_Event_Bus::dispatch( 'bid_placed', [
            'auction_id' => $auction_id,
            'user_id'    => $user_id,
            'amount'     => $bid,
            'statuses'   => $statuses,
        ] );

        if ( ! $silent_enabled && $prev_lead_user && $prev_lead_user !== $new_lead_user ) {
            WPAM_Event_Bus::dispatch( 'user_outbid', [
                'auction_id' => $auction_id,
                'user_id'    => $prev_lead_user,
            ] );
        }

        if ( $max_reached ) {
            WPAM_Event_Bus::dispatch( 'max_exceeded', [
                'auction_id' => $auction_id,
                'user_id'    => $user_id,
            ] );
        }

        $message  = $sealed ? __( 'Sealed bid submitted', 'wpam' ) : __( 'Bid received', 'wpam' );
        if ( $max_reached ) {
            $message = __( 'Max bid reached', 'wpam' );
        }

        $response = [
            'message'  => $message,
            'status'   => isset( $statuses[ $user_id ] ) ? $statuses[ $user_id ] : '',
            'statuses' => $statuses,
        ];
        if ( $extended ) {
            $response['new_end_ts'] = $new_end_ts;
            $response['extended']   = true;
            WPAM_Event_Bus::dispatch( 'auction_extended', [
                'auction_id' => $auction_id,
                'new_end_ts' => $new_end_ts,
            ] );
        }
        if ( $max_reached ) {
            $response['max_reached'] = true;
        }

        return rest_ensure_response( $response );
    }

    /**
     * REST endpoint returning highest bid.
     */
    public static function rest_get_highest_bid( \WP_REST_Request $request ) {
        $auction_id = absint( $request['auction_id'] );
        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $reverse = self::is_reverse( $auction_id );
        $sealed  = self::is_sealed( $auction_id );

        $query   = $reverse ? "SELECT MIN(bid_amount) FROM $table WHERE auction_id = %d" : "SELECT MAX(bid_amount) FROM $table WHERE auction_id = %d";
        $highest = $wpdb->get_var( $wpdb->prepare( $query, $auction_id ) );
        $highest = $highest ? floatval( $highest ) : 0;

        if ( $sealed || self::silent_enabled( $auction_id ) ) {
            $end   = get_post_meta( $auction_id, '_auction_end', true );
            $end_ts = $end ? ( new \DateTimeImmutable( $end, wp_timezone() ) )->getTimestamp() : 0;
            if ( ( new \DateTimeImmutable( 'now', wp_timezone() ) )->getTimestamp() < $end_ts ) {
                $highest   = 0;
                $lead_user = 0;
            }
        }

        $ending_reason = '';
        if ( WPAM_Auction_State::ENDED === get_post_meta( $auction_id, '_auction_state', true ) ) {
            $ending_reason = get_post_meta( $auction_id, '_auction_ending_reason', true );
        }

        $response = [ 'highest_bid' => $highest, 'lead_user' => $lead_user ];
        if ( $ending_reason ) {
            $response['ending_reason'] = $ending_reason;
        }

        return rest_ensure_response( $response );
    }

    public function add_account_endpoints() {
        add_rewrite_endpoint( 'my-bids', EP_ROOT | EP_PAGES );
        add_rewrite_endpoint( 'auctions-won', EP_ROOT | EP_PAGES );
    }

    public function add_account_menu_items( $items ) {
        $items['my-bids']      = __( 'My Bids', 'wpam' );
        $items['auctions-won'] = __( 'Auctions Won', 'wpam' );
        return $items;
    }

    public function render_my_bids_page() {
        $user_id = get_current_user_id();
        $bids    = $user_id ? $this->get_user_bids( $user_id ) : [];
        include WPAM_PLUGIN_DIR . 'templates/my-bids.php';
    }

    public function render_auctions_won_page() {
        $user_id  = get_current_user_id();
        $auctions = $user_id ? $this->get_user_won_auctions( $user_id ) : [];
        include WPAM_PLUGIN_DIR . 'templates/auctions-won.php';
    }

    private function get_user_bids( $user_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_bids';

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT auction_id, bid_amount, bid_time FROM $table WHERE user_id = %d ORDER BY bid_time DESC",
                $user_id
            ),
            ARRAY_A
        );

        $bids = [];
        foreach ( $rows as $row ) {
            $bids[] = [
                'id'     => intval( $row['auction_id'] ),
                'title'  => get_the_title( $row['auction_id'] ),
                'url'    => get_permalink( $row['auction_id'] ),
                'amount' => floatval( $row['bid_amount'] ),
                'time'   => mysql2date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $row['bid_time'] ),
            ];
        }

        return $bids;
    }

    private function get_user_won_auctions( $user_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_bids';

        $auction_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT DISTINCT b1.auction_id FROM $table b1 LEFT JOIN $table b2 ON b1.auction_id = b2.auction_id AND b2.bid_amount > b1.bid_amount WHERE b1.user_id = %d AND b2.id IS NULL",
                $user_id
            )
        );

        $won = [];
        $now = ( new \DateTimeImmutable( 'now', wp_timezone() ) )->getTimestamp();
        foreach ( $auction_ids as $auction_id ) {
            $end   = get_post_meta( $auction_id, '_auction_end', true );
            $end_ts = $end ? ( new \DateTimeImmutable( $end, wp_timezone() ) )->getTimestamp() : 0;
            if ( $end_ts && $end_ts <= $now ) {
                $won[] = [
                    'id'    => intval( $auction_id ),
                    'title' => get_the_title( $auction_id ),
                    'url'   => get_permalink( $auction_id ),
                ];
            }
        }

        return $won;
    }

    public function get_recent_logs_for_auction( $auction_id, $limit = 10 ) {
        global $wpdb;
        $audit = $wpdb->prefix . 'wc_auction_audit';
        $bids  = $wpdb->prefix . 'wc_auction_bids';

        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT a.* FROM $audit a JOIN $bids b ON a.bid_id = b.id WHERE b.auction_id = %d ORDER BY a.logged_at DESC LIMIT %d",
                $auction_id,
                $limit
            ),
            ARRAY_A
        );
    }

    public function get_recent_logs_for_user( $user_id, $limit = 10 ) {
        global $wpdb;
        $audit = $wpdb->prefix . 'wc_auction_audit';

        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $audit WHERE user_id = %d ORDER BY logged_at DESC LIMIT %d",
                $user_id,
                $limit
            ),
            ARRAY_A
        );
    }
}
