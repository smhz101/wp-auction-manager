<?php
class WCAP_Public {
    public function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
    }

    public function enqueue_scripts() {
        wp_enqueue_script( 'wcap-ajax-bid', WCAP_PLUGIN_URL . 'public/js/ajax-bid.js', [ 'jquery' ], WCAP_PLUGIN_VERSION, true );
        wp_localize_script( 'wcap-ajax-bid', 'wcap_ajax', [ 'ajax_url' => admin_url( 'admin-ajax.php' ) ] );
    }
}
