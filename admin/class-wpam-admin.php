<?php
class WPAM_Admin {
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
    }

    public function add_menu() {
        add_menu_page( 
            __( 'WP Auction Manager', 'wpam' ),
            __( 'Auctions', 'wpam' ),
            'manage_options',
            'wpam-admin',
            [ $this, 'render_page' ]
        );
    }

    public function render_page() {
        echo '<div class="wrap"><h1>' . esc_html__( 'WP Auction Manager', 'wpam' ) . '</h1></div>';
    }
}
