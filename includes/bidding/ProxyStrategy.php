<?php
namespace WPAM\Includes\Bidding;

use WPAM\Includes\WPAM_Auction;
use WPAM\Includes\WPAM_Bid;

class ProxyStrategy implements BidStrategyInterface {
    public function place_bid( int $auction_id, int $user_id, float $bid, float $max_bid ) {
        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_bids';

        $max_retries = 3;
        for ( $attempt = 0; $attempt < $max_retries; $attempt++ ) {
            $wpdb->query( 'START TRANSACTION' );

            try {
                $order       = 'DESC';
                $highest_row = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1 FOR UPDATE", $auction_id ), ARRAY_A );
                $highest     = $highest_row ? ( function_exists( 'wc_format_decimal' ) ? (float) wc_format_decimal( $highest_row['bid_amount'] ) : (float) $highest_row['bid_amount'] ) : 0;
                $highest_user = $highest_row ? intval( $highest_row['user_id'] ) : 0;

                $increment = WPAM_Auction::get_bid_increment( $auction_id, $highest );

                if ( $max_bid < $highest + $increment ) {
                    $wpdb->query( 'ROLLBACK' );
                    $min_bid_allowed = $highest + $increment;
                    $formatted       = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $min_bid_allowed ) : $min_bid_allowed;
                    wp_send_json_error(
                        [
                            'message' => sprintf( __( 'Bid too low. Minimum bid is %s', 'wpam' ), $formatted ),
                            'min_bid' => (float) $min_bid_allowed,
                        ]
                    );
                }

                $place_bid = ( $highest > 0 ) ? min( $max_bid, $highest + $increment ) : $max_bid;
                $insert    = $wpdb->insert(
                    $table,
                    [
                        'auction_id' => $auction_id,
                        'user_id'    => $user_id,
                        'bid_amount' => $place_bid,
                        'bid_time'   => wp_date( 'Y-m-d H:i:s', null, new \DateTimeZone( 'UTC' ) ),
                    ],
                    [ '%d', '%d', '%f', '%s' ]
                );

                if ( false === $insert ) {
                    throw new \Exception( 'insert failed' );
                }

                WPAM_Bid::log_bid( $wpdb->insert_id, $user_id );
                do_action( 'wpam_bid_placed', $auction_id, $user_id, $place_bid );
                update_user_meta( $user_id, 'wpam_proxy_max_' . $auction_id, $max_bid );

                $bid = $place_bid;

                if ( $highest_user && $highest_user !== $user_id ) {
                    $prev_max = get_user_meta( $highest_user, 'wpam_proxy_max_' . $auction_id, true );
                    $prev_max = $prev_max ? ( function_exists( 'wc_format_decimal' ) ? (float) wc_format_decimal( $prev_max ) : (float) $prev_max ) : $highest;
                    if ( $prev_max > $place_bid ) {
                        $auto_bid = min( $prev_max, $place_bid + $increment );
                        $auto     = $wpdb->insert(
                            $table,
                            [
                                'auction_id' => $auction_id,
                                'user_id'    => $highest_user,
                                'bid_amount' => $auto_bid,
                                'bid_time'   => wp_date( 'Y-m-d H:i:s', null, new \DateTimeZone( 'UTC' ) ),
                            ],
                            [ '%d', '%d', '%f', '%s' ]
                        );

                        if ( false === $auto ) {
                            throw new \Exception( 'auto-bid insert failed' );
                        }

                        WPAM_Bid::log_bid( $wpdb->insert_id, $highest_user );
                        do_action( 'wpam_bid_placed', $auction_id, $highest_user, $auto_bid );
                        $bid = $auto_bid;
                    } else {
                        $highest_user = $user_id;
                    }
                } else {
                    $highest_user = $user_id;
                }

                $wpdb->query( 'COMMIT' );
                return [ 'bid' => $bid ];
            } catch ( \Throwable $e ) {
                $wpdb->query( 'ROLLBACK' );
                if ( $attempt === $max_retries - 1 ) {
                    wp_send_json_error( [ 'message' => __( 'Could not place bid. Please try again.', 'wpam' ) ] );
                }

                usleep( 50000 ); // brief pause before retrying
            }
        }
    }
}
