<?php
namespace WPAM\Includes\Bidding;

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
        $insert_id = $wpdb->insert_id;
        WPAM_Bid::log_bid( $insert_id, $user_id );
        do_action( 'wpam_bid_placed', $auction_id, $user_id, $bid );

        return [ 'bid' => $bid ];
    }
}
