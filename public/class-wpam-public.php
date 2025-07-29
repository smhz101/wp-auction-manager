<?php
class WPAM_Public {
    public function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
    }

    public function enqueue_scripts() {
        $provider       = get_option( 'wpam_realtime_provider', 'none' );
        $pusher_enabled = ( 'pusher' === $provider );

        if ( $pusher_enabled ) {
            wp_enqueue_script( 'pusher-js', 'https://js.pusher.com/7.2/pusher.min.js', [], '7.2', true );
        }

        wp_enqueue_script( 'wpam-ajax-bid', WPAM_PLUGIN_URL . 'public/js/ajax-bid.js', [ 'jquery' ], WPAM_PLUGIN_VERSION, true );
        wp_localize_script(
            'wpam-ajax-bid',
            'wpam_ajax',
            [
                'ajax_url'        => admin_url( 'admin-ajax.php' ),
                'bid_nonce'       => wp_create_nonce( 'wpam_place_bid' ),
                'watchlist_nonce' => wp_create_nonce( 'wpam_toggle_watchlist' ),
                'highest_nonce'   => wp_create_nonce( 'wpam_get_highest_bid' ),
                'pusher_enabled'  => $pusher_enabled,
                'pusher_key'      => get_option( 'wpam_pusher_key' ),
                'pusher_cluster'  => get_option( 'wpam_pusher_cluster' ),
                'pusher_channel'  => 'wpam-auctions',
            ]
        );

        wp_enqueue_script( 'wpam-ajax-messages', WPAM_PLUGIN_URL . 'public/js/ajax-messages.js', [ 'jquery' ], WPAM_PLUGIN_VERSION, true );
        wp_localize_script(
            'wpam-ajax-messages',
            'wpam_messages',
            [
                'ajax_url'      => admin_url( 'admin-ajax.php' ),
                'message_nonce' => wp_create_nonce( 'wpam_submit_question' ),
            ]
        );
    }
}
