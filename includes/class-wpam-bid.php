<?php
class WPAM_Bid {
    protected $realtime_provider;

    public function __construct() {
        add_action( 'wp_ajax_wpam_place_bid', [ $this, 'place_bid' ] );
        add_action( 'wp_ajax_nopriv_wpam_place_bid', [ $this, 'place_bid' ] );
        add_action( 'wp_ajax_wpam_get_highest_bid', [ $this, 'get_highest_bid' ] );
        add_action( 'wp_ajax_nopriv_wpam_get_highest_bid', [ $this, 'get_highest_bid' ] );

        if ( class_exists( 'WPAM_Pusher_Provider' ) ) {
            $this->realtime_provider = new WPAM_Pusher_Provider();
        }
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
        $increment = $increment ? floatval( $increment ) : 1;

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


        WPAM_Notifications::notify_new_bid( $auction_id, $bid, $user_id );

        if ( $this->realtime_provider ) {
            $this->realtime_provider->send_bid_update( $auction_id, $bid );
        }

        wp_send_json_success( [ 'message' => __( 'Bid received', 'wpam' ) ] );

//         $extended       = false;
//         $new_end_ts     = $end_ts;
//         $threshold      = absint( get_option( 'wpam_soft_close_threshold', 30 ) );
//         $extension      = absint( get_option( 'wpam_soft_close_extend', 30 ) );

//         if ( $end_ts - $now <= $threshold ) {
//             $new_end_ts = $end_ts + $extension;
//             update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', $new_end_ts ) );
//             $extended = true;
//         }

//         $response = [ 'message' => __( 'Bid received', 'wpam' ) ];
//         if ( $extended ) {
//             $response['new_end_ts'] = $new_end_ts;
//         }

//         wp_send_json_success( $response );
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

        wp_send_json_success( [ 'highest_bid' => $highest ] );
    }
}
