<?php
class WPAM_Public {
    public function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
    }

    public function enqueue_scripts() {
        wp_enqueue_script( 'wpam-ajax-bid', WPAM_PLUGIN_URL . 'public/js/ajax-bid.js', [ 'jquery' ], WPAM_PLUGIN_VERSION, true );
        wp_localize_script(
            'wpam-ajax-bid',
            'wpam_ajax',
            [
                'ajax_url'        => admin_url( 'admin-ajax.php' ),
                'bid_nonce'       => wp_create_nonce( 'wpam_place_bid' ),
                'watchlist_nonce' => wp_create_nonce( 'wpam_toggle_watchlist' ),
            ]
        );
    }
}
