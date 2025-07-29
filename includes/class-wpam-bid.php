<?php
class WPAM_Bid {
    public function __construct() {
        add_action( 'wp_ajax_wpam_place_bid', [ $this, 'place_bid' ] );
        add_action( 'wp_ajax_nopriv_wpam_place_bid', [ $this, 'place_bid' ] );
    }

    public function place_bid() {
        if ( empty( $_POST['auction_id'] ) || empty( $_POST['bid'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid bid data', 'wpam' ) ] );
        }

        $auction_id = absint( $_POST['auction_id'] );
        $bid        = floatval( $_POST['bid'] );
        $user_id    = get_current_user_id();

        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_bids';

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

        wp_send_json_success( [ 'message' => __( 'Bid received', 'wpam' ) ] );
    }
}
