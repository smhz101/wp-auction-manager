<?php
class WPAM_Admin {
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    public function add_menu() {
        add_menu_page(
            __( 'WP Auction Manager', 'wpam' ),
            __( 'Auctions', 'wpam' ),
            'manage_options',
            'wpam-auctions',
            [ $this, 'render_auctions_page' ],
            'dashicons-hammer'
        );

        add_submenu_page(
            'wpam-auctions',
            __( 'All Auctions', 'wpam' ),
            __( 'All Auctions', 'wpam' ),
            'manage_options',
            'wpam-auctions',
            [ $this, 'render_auctions_page' ]
        );

        add_submenu_page(
            'wpam-auctions',
            __( 'Bids', 'wpam' ),
            __( 'Bids', 'wpam' ),
            'manage_options',
            'wpam-bids',
            [ $this, 'render_bids_page' ]
        );

        add_submenu_page(
            'wpam-auctions',
            __( 'Integrations', 'wpam' ),
            __( 'Settings', 'wpam' ),
            'manage_options',
            'wpam-settings',
            [ $this, 'render_settings_page' ]
        );
    }

    public function register_settings() {
        register_setting( 'wpam_settings', 'wpam_default_increment' );
        register_setting( 'wpam_settings', 'wpam_soft_close' );
        register_setting( 'wpam_settings', 'wpam_enable_twilio' );
        register_setting( 'wpam_settings', 'wpam_enable_pusher' );
        register_setting( 'wpam_settings', 'wpam_enable_firebase' );
        register_setting( 'wpam_settings', 'wpam_twilio_sid' );
        register_setting( 'wpam_settings', 'wpam_twilio_token' );
        register_setting( 'wpam_settings', 'wpam_twilio_from' );

        add_settings_section( 'wpam_general', __( 'Auction Defaults', 'wpam' ), '__return_false', 'wpam_settings' );
        add_settings_section( 'wpam_providers', __( 'Providers', 'wpam' ), '__return_false', 'wpam_settings' );
        add_settings_section( 'wpam_twilio', __( 'Twilio Integration', 'wpam' ), '__return_false', 'wpam_settings' );

        add_settings_field(
            'wpam_default_increment',
            __( 'Default Bid Increment', 'wpam' ),
            [ $this, 'field_default_increment' ],
            'wpam_settings',
            'wpam_general'
        );

        add_settings_field(
            'wpam_soft_close',
            __( 'Soft Close Duration (minutes)', 'wpam' ),
            [ $this, 'field_soft_close' ],
            'wpam_settings',
            'wpam_general'
        );

        add_settings_field(
            'wpam_enable_twilio',
            __( 'Enable Twilio Notifications', 'wpam' ),
            [ $this, 'field_enable_twilio' ],
            'wpam_settings',
            'wpam_providers'
        );

        add_settings_field(
            'wpam_enable_pusher',
            __( 'Enable Pusher', 'wpam' ),
            [ $this, 'field_enable_pusher' ],
            'wpam_settings',
            'wpam_providers'
        );

        add_settings_field(
            'wpam_enable_firebase',
            __( 'Enable Firebase', 'wpam' ),
            [ $this, 'field_enable_firebase' ],
            'wpam_settings',
            'wpam_providers'
        );

        add_settings_field(
            'wpam_twilio_sid',
            __( 'Twilio SID', 'wpam' ),
            [ $this, 'field_twilio_sid' ],
            'wpam_settings',
            'wpam_twilio'
        );

        add_settings_field(
            'wpam_twilio_token',
            __( 'Twilio Token', 'wpam' ),
            [ $this, 'field_twilio_token' ],
            'wpam_settings',
            'wpam_twilio'
        );

        add_settings_field(
            'wpam_twilio_from',
            __( 'Twilio From Number', 'wpam' ),
            [ $this, 'field_twilio_from' ],
            'wpam_settings',
            'wpam_twilio'
        );
    }

    public function field_default_increment() {
        $value = esc_attr( get_option( 'wpam_default_increment', 1 ) );
        echo '<input type="number" step="0.01" name="wpam_default_increment" value="' . $value . '" class="small-text" />';
    }

    public function field_soft_close() {
        $value = esc_attr( get_option( 'wpam_soft_close', 0 ) );
        echo '<input type="number" step="1" name="wpam_soft_close" value="' . $value . '" class="small-text" />';
    }

    public function field_enable_twilio() {
        $checked = checked( 1, get_option( 'wpam_enable_twilio', 0 ), false );
        echo '<label><input type="checkbox" name="wpam_enable_twilio" value="1" ' . $checked . ' /> ' . __( 'Enable', 'wpam' ) . '</label>';
    }

    public function field_enable_pusher() {
        $checked = checked( 1, get_option( 'wpam_enable_pusher', 0 ), false );
        echo '<label><input type="checkbox" name="wpam_enable_pusher" value="1" ' . $checked . ' /> ' . __( 'Enable', 'wpam' ) . '</label>';
    }

    public function field_enable_firebase() {
        $checked = checked( 1, get_option( 'wpam_enable_firebase', 0 ), false );
        echo '<label><input type="checkbox" name="wpam_enable_firebase" value="1" ' . $checked . ' /> ' . __( 'Enable', 'wpam' ) . '</label>';
    }

    public function field_twilio_sid() {
        $value = esc_attr( get_option( 'wpam_twilio_sid', '' ) );
        echo '<input type="text" class="regular-text" name="wpam_twilio_sid" value="' . $value . '" />';
    }

    public function field_twilio_token() {
        $value = esc_attr( get_option( 'wpam_twilio_token', '' ) );
        echo '<input type="text" class="regular-text" name="wpam_twilio_token" value="' . $value . '" />';
    }

    public function field_twilio_from() {
        $value = esc_attr( get_option( 'wpam_twilio_from', '' ) );
        echo '<input type="text" class="regular-text" name="wpam_twilio_from" value="' . $value . '" />';
    }

    public function render_auctions_page() {
        require_once WPAM_PLUGIN_DIR . 'admin/class-wpam-auctions-table.php';
        $table = new WPAM_Auctions_Table();
        $table->prepare_items();
        echo '<div class="wrap">';
        echo '<h1>' . esc_html__( 'Auctions', 'wpam' ) . '</h1>';
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="wpam-auctions" />';
        $table->views();
        $table->display();
        echo '</form></div>';
    }

    public function render_bids_page() {
        require_once WPAM_PLUGIN_DIR . 'admin/class-wpam-bids-table.php';
        $auction_id = isset( $_GET['auction_id'] ) ? absint( $_GET['auction_id'] ) : 0;
        echo '<div class="wrap">';
        if ( ! $auction_id ) {
            echo '<h1>' . esc_html__( 'Bids', 'wpam' ) . '</h1>';
            echo '<p>' . esc_html__( 'No auction selected.', 'wpam' ) . '</p>';
            echo '</div>';
            return;
        }
        $table = new WPAM_Bids_Table( $auction_id );
        $table->prepare_items();
        echo '<h1>' . sprintf( esc_html__( 'Bids for Auction #%d', 'wpam' ), $auction_id ) . '</h1>';
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="wpam-bids" />';
        echo '<input type="hidden" name="auction_id" value="' . esc_attr( $auction_id ) . '" />';
        $table->display();
        echo '</form></div>';
    }

    public function render_settings_page() {
        echo '<div class="wrap">';
        echo '<h1>' . esc_html__( 'Integrations', 'wpam' ) . '</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields( 'wpam_settings' );
        do_settings_sections( 'wpam_settings' );
        submit_button();
        echo '</form></div>';
    }
}
