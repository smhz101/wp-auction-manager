<?php
class WCAP_Bid {
    public function __construct() {
        add_action( 'wp_ajax_wcap_place_bid', [ $this, 'place_bid' ] );
        add_action( 'wp_ajax_nopriv_wcap_place_bid', [ $this, 'place_bid' ] );
    }

    public function place_bid() {
        // Placeholder for AJAX bid handling
        wp_send_json_success( [ 'message' => 'Bid received' ] );
    }
}
