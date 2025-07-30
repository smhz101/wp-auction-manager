<?php
namespace WPAM\Includes;

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

    private function proxy_enabled( $auction_id ) {
        return get_option( 'wpam_enable_proxy_bidding' ) && get_post_meta( $auction_id, '_auction_proxy_bidding', true );
    }

    private function silent_enabled( $auction_id ) {
        return get_option( 'wpam_enable_silent_bidding' ) && get_post_meta( $auction_id, '_auction_silent_bidding', true );
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

        $start_ts = $start ? strtotime( $start ) : 0;
        $end_ts   = $end ? strtotime( $end ) : 0;

        $now = current_time( 'timestamp' );

        if ( $now < $start_ts || $now > $end_ts ) {
            wp_send_json_error( [ 'message' => __( 'Auction not active', 'wpam' ) ] );
        }

        global $wpdb;
        $table        = $wpdb->prefix . 'wc_auction_bids';
        $highest_row  = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount DESC, id DESC LIMIT 1", $auction_id ), ARRAY_A );
        $highest      = $highest_row ? floatval( $highest_row['bid_amount'] ) : 0;
        $highest_user = $highest_row ? intval( $highest_row['user_id'] ) : 0;

        $proxy_enabled  = $this->proxy_enabled( $auction_id );
        $silent_enabled = $this->silent_enabled( $auction_id );
        $max_bid        = isset( $_POST['max_bid'] ) ? floatval( $_POST['max_bid'] ) : $bid;
        if ( $max_bid < $bid ) {
            $max_bid = $bid;
        }

        $max_bids = intval( get_post_meta( $auction_id, '_auction_max_bids', 0 ) );
        if ( $max_bids > 0 ) {
            $count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE auction_id = %d AND user_id = %d", $auction_id, $user_id ) );
            if ( $count >= $max_bids ) {
                wp_send_json_error( [ 'message' => __( 'Bid limit reached', 'wpam' ) ] );
            }
        }

        $increment = get_post_meta( $auction_id, '_auction_increment', true );
        if ( '' === $increment ) {
            $increment = get_option( 'wpam_default_increment', 1 );
        }
        $increment = floatval( $increment );

        if ( ! $proxy_enabled ) {
            if ( $bid < $highest + $increment ) {
                wp_send_json_error( [ 'message' => __( 'Bid too low', 'wpam' ) ] );
            }

            $wpdb->insert(
                $table,
                [
                    'auction_id' => $auction_id,
                    'user_id'    => $user_id,
                    'bid_amount' => $bid,
                    'bid_time'   => current_time( 'mysql' ),
                ],
                [ '%d', '%d', '%f', '%s' ]
            );

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
                    'bid_time'   => current_time( 'mysql' ),
                ],
                [ '%d', '%d', '%f', '%s' ]
            );
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
                            'bid_time'   => current_time( 'mysql' ),
                        ],
                        [ '%d', '%d', '%f', '%s' ]
                    );
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

        if ( $threshold > 0 && $end_ts - $now <= $threshold ) {
            $new_end_ts = $end_ts + $extension;
            update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', $new_end_ts ) );
            wp_clear_scheduled_hook( 'wpam_auction_end', [ $auction_id ] );
            wp_schedule_single_event( $new_end_ts, 'wpam_auction_end', [ $auction_id ] );
            $extended = true;
        }

        // SMS notification via Twilio if enabled
        if ( ! $silent_enabled && get_option( 'wpam_enable_twilio' ) ) {
            if ( class_exists( 'WPAM_Twilio_Provider' ) ) {
                $provider = new WPAM_Twilio_Provider();
                $provider->send(
                    get_option( 'wpam_twilio_from' ),
                    sprintf( __( 'New bid of %s on auction #%d', 'wpam' ), $bid, $auction_id )
                );
            }
        }

        // Always send internal notifications
        WPAM_Notifications::notify_new_bid( $auction_id, $bid, $highest_user );

        if ( ! $silent_enabled && $this->realtime_provider ) {
            $this->realtime_provider->send_bid_update( $auction_id, $bid );
        }

        $response = [ 'message' => __( 'Bid received', 'wpam' ) ];
        if ( $extended ) {
            $response['new_end_ts'] = $new_end_ts;
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
        $highest = $wpdb->get_var( $wpdb->prepare( "SELECT MAX(bid_amount) FROM $table WHERE auction_id = %d", $auction_id ) );
        $highest = $highest ? floatval( $highest ) : 0;

        if ( $this->silent_enabled( $auction_id ) ) {
            $end   = get_post_meta( $auction_id, '_auction_end', true );
            $end_ts = $end ? strtotime( $end ) : 0;
            if ( current_time( 'timestamp' ) < $end_ts ) {
                $highest = 0;
            }
        }

        wp_send_json_success( [ 'highest_bid' => $highest ] );
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
        $now = current_time( 'timestamp' );
        foreach ( $auction_ids as $auction_id ) {
            $end   = get_post_meta( $auction_id, '_auction_end', true );
            $end_ts = $end ? strtotime( $end ) : 0;
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
}
