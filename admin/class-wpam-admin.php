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
            __( 'Messages', 'wpam' ),
            __( 'Messages', 'wpam' ),
            'manage_options',
            'wpam-messages',
            [ $this, 'render_messages_page' ]
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
        register_setting( 'wpam_settings', 'wpam_twilio_sid' );
        register_setting( 'wpam_settings', 'wpam_twilio_token' );
        register_setting( 'wpam_settings', 'wpam_twilio_from' );

        add_settings_section( 'wpam_twilio', __( 'Twilio Integration', 'wpam' ), '__return_false', 'wpam_settings' );

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

    public function render_messages_page() {
        require_once WPAM_PLUGIN_DIR . 'admin/class-wpam-messages-table.php';

        if ( isset( $_GET['action'], $_GET['message'] ) && in_array( $_GET['action'], [ 'approve', 'unapprove' ], true ) ) {
            $message_id = absint( $_GET['message'] );
            check_admin_referer( 'wpam_toggle_message_' . $message_id );
            global $wpdb;
            $table = $wpdb->prefix . 'wc_auction_messages';
            $approved = 'approve' === $_GET['action'] ? 1 : 0;
            $wpdb->update( $table, [ 'approved' => $approved ], [ 'id' => $message_id ], [ '%d' ], [ '%d' ] );
            echo '<div class="updated"><p>' . esc_html__( 'Message updated.', 'wpam' ) . '</p></div>';
        }

        $table = new WPAM_Messages_Table();
        $table->prepare_items();
        echo '<div class="wrap">';
        echo '<h1>' . esc_html__( 'Auction Messages', 'wpam' ) . '</h1>';
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="wpam-messages" />';
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
