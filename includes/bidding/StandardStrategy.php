<?php
namespace WPAM\Includes\Bidding;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

use WPAM\Includes\WPAM_Auction;
use WPAM\Includes\WPAM_Bid;

class StandardStrategy implements BidStrategyInterface {
    public function place_bid( int $auction_id, int $user_id, float $bid, float $max_bid ) {
        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $reverse = 'reverse' === get_post_meta( $auction_id, '_auction_type', true );

        $order       = $reverse ? 'ASC' : 'DESC';
        $highest_row = $wpdb->get_row( $wpdb->prepare( "SELECT bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1", $auction_id ) );
        $highest     = $highest_row ? ( function_exists( 'wc_format_decimal' ) ? (float) wc_format_decimal( $highest_row->bid_amount ) : (float) $highest_row->bid_amount ) : 0;

        $increment = WPAM_Auction::get_bid_increment( $auction_id, $highest );

        if ( $reverse ) {
            if ( $highest_row && $bid > $highest - $increment ) {
                $max_bid_allowed = $highest - $increment;
                $formatted       = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $max_bid_allowed ) : $max_bid_allowed;
                wp_send_json_error(
                    [
                        'message' => sprintf( __( 'Bid too high. Maximum bid is %s', 'wpam' ), $formatted ),
                        'max_bid' => (float) $max_bid_allowed,
                    ]
                );
            }
        } else {
            if ( $bid < $highest + $increment ) {
                $min_bid_allowed = $highest + $increment;
                $formatted       = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $min_bid_allowed ) : $min_bid_allowed;
                wp_send_json_error(
                    [
                        'message' => sprintf( __( 'Bid too low. Minimum bid is %s', 'wpam' ), $formatted ),
                        'min_bid' => (float) $min_bid_allowed,
                    ]
                );
            }
        }

        $wpdb->insert(
            $table,
            [
                'auction_id' => $auction_id,
                'user_id'    => $user_id,
                'bid_amount' => $bid,
                'bid_time'   => wp_date( 'Y-m-d H:i:s', null, new \DateTimeZone( 'UTC' ) ),
            ],
            [ '%d', '%d', '%f', '%s' ]
        );
        $insert_id = $wpdb->insert_id;
        WPAM_Bid::log_bid( $insert_id, $user_id );
        do_action( 'wpam_bid_placed', $auction_id, $user_id, $bid );

        return [ 'bid' => $bid ];
    }
}
