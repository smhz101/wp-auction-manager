<?php
class WPAM_Watchlist {
    public function __construct() {
        add_action( 'wp_ajax_wpam_toggle_watchlist', [ $this, 'toggle_watchlist' ] );
        add_action( 'wp_ajax_nopriv_wpam_toggle_watchlist', [ $this, 'toggle_watchlist' ] );
    }

    public function toggle_watchlist() {
        check_ajax_referer( 'wpam_toggle_watchlist', 'nonce' );

        if ( empty( $_POST['auction_id'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid auction', 'wpam' ) ] );
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please login', 'wpam' ) ] );
        }

        $auction_id = absint( $_POST['auction_id'] );
        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_watchlists';
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d AND auction_id = %d", $user_id, $auction_id ) );
        if ( $existing ) {
            $wpdb->delete( $table, [ 'id' => $existing ], [ '%d' ] );
            wp_send_json_success( [ 'message' => __( 'Removed from watchlist', 'wpam' ) ] );
        } else {
            $wpdb->insert( $table, [
                'user_id'    => $user_id,
                'auction_id' => $auction_id,
            ], [ '%d', '%d' ] );
            wp_send_json_success( [ 'message' => __( 'Added to watchlist', 'wpam' ) ] );
        }
    }
}

