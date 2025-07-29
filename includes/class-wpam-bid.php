<?php
class WPAM_Bid {
    public function __construct() {
        add_action( 'wp_ajax_wpam_place_bid', [ $this, 'place_bid' ] );
        add_action( 'wp_ajax_nopriv_wpam_place_bid', [ $this, 'place_bid' ] );
    }

    public function place_bid() {
        check_ajax_referer( 'wpam_place_bid', 'nonce' );

        if ( empty( $_POST['auction_id'] ) || empty( $_POST['bid'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid bid data', 'wpam' ) ] );
        }

        $auction_id = absint( $_POST['auction_id'] );
        $bid        = floatval( $_POST['bid'] );
        $user_id    = get_current_user_id();

        $start = get_post_meta( $auction_id, '_auction_start', true );
        $end   = get_post_meta( $auction_id, '_auction_end', true );

        $start_ts = $start ? strtotime( $start ) : 0;
        $end_ts   = $end ? strtotime( $end ) : 0;

        $now = current_time( 'timestamp' );

        if ( $now < $start_ts || $now > $end_ts ) {
            wp_send_json_error( [ 'message' => __( 'Auction not active', 'wpam' ) ] );
        }

        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $highest = $wpdb->get_var( $wpdb->prepare( "SELECT MAX(bid_amount) FROM $table WHERE auction_id = %d", $auction_id ) );
        $highest = $highest ? floatval( $highest ) : 0;

        $increment = get_post_meta( $auction_id, '_auction_increment', true );
        if ( '' === $increment ) {
            $increment = get_option( 'wpam_default_increment', 1 );
        }
        $increment = floatval( $increment );

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

        // Extend auction end time if within soft close window
        $soft_close = intval( get_option( 'wpam_soft_close', 0 ) );
        if ( $soft_close > 0 && $end_ts - $now <= $soft_close * 60 ) {
            $new_end = date( 'Y-m-d H:i:s', $end_ts + ( $soft_close * 60 ) );
            update_post_meta( $auction_id, '_auction_end', $new_end );
        }

        // Basic notification via Twilio if enabled
        if ( get_option( 'wpam_enable_twilio' ) ) {
            if ( class_exists( 'WPAM_Twilio_Provider' ) ) {
                $provider = new WPAM_Twilio_Provider();
                $provider->send( get_option( 'wpam_twilio_from' ), sprintf( __( 'New bid of %s on auction #%d', 'wpam' ), $bid, $auction_id ) );
            }
        }

        wp_send_json_success( [ 'message' => __( 'Bid received', 'wpam' ) ] );
    }
}
