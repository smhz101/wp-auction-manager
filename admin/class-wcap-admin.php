<?php
class WCAP_Admin {
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
    }

    public function add_menu() {
        add_menu_page( 
            __( 'WP Auction Manager', 'wcap' ),
            __( 'Auctions', 'wcap' ),
            'manage_options',
            'wcap-admin',
            [ $this, 'render_page' ]
        );
    }

    public function render_page() {
        echo '<div class="wrap"><h1>' . esc_html__( 'WP Auction Manager', 'wcap' ) . '</h1></div>';
    }
}
