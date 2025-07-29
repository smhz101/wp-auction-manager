<?php
namespace WPAM\Public;

class WPAM_Public {
    public function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_shortcode( 'wpam_auction_app', [ $this, 'render_react_app' ] );

        // Register template loader on init so custom templates can be swapped in.
        add_action( 'init', [ $this, 'register_template_hook' ] );
    }

    /**
     * Hook the template loader filter.
     */
    public function register_template_hook() {
        add_filter( 'template_include', [ $this, 'template_loader' ] );
    }

    /**
     * Conditionally load custom templates for auction views.
     *
     * @param string $template Current template path.
     *
     * @return string
     */
    public function template_loader( $template ) {
        if ( is_singular( 'product' ) ) {
            $product = wc_get_product( get_queried_object_id() );
            if ( $product && 'auction' === $product->get_type() ) {
                $this->enqueue_scripts();
                add_action( 'woocommerce_single_product_summary', [ $this, 'render_auction_meta' ], 6 );
                add_action( 'woocommerce_single_product_summary', [ $this, 'render_bid_form' ], 25 );
                add_action( 'woocommerce_single_product_summary', [ $this, 'render_watchlist_button' ], 26 );
                add_action( 'woocommerce_single_product_summary', [ $this, 'render_messages' ], 30 );
            }
        }

        if ( is_tax( 'product_type', 'auction' ) ) {
            $this->enqueue_scripts();

            $custom = WPAM_PLUGIN_DIR . 'templates/auction-listing.php';
            return file_exists( $custom ) ? $custom : $template;
        }

        return $template;
    }

    public function enqueue_scripts() {
        $provider       = get_option( 'wpam_realtime_provider', 'none' );
        $pusher_enabled = ( 'pusher' === $provider );

        if ( $pusher_enabled ) {
            wp_enqueue_script( 'pusher-js', 'https://js.pusher.com/7.2/pusher.min.js', [], '7.2', true );
        }

        wp_enqueue_style( 'wpam-frontend', WPAM_PLUGIN_URL . 'public/css/wpam-frontend.css', [ 'woocommerce-general' ], WPAM_PLUGIN_VERSION );

        wp_enqueue_script( 'wpam-ajax-bid', WPAM_PLUGIN_URL . 'public/js/ajax-bid.js', [ 'jquery' ], WPAM_PLUGIN_VERSION, true );
        wp_localize_script(
            'wpam-ajax-bid',
            'wpam_ajax',
            [
                'ajax_url'        => admin_url( 'admin-ajax.php' ),
                'bid_nonce'       => wp_create_nonce( 'wpam_place_bid' ),
                'watchlist_nonce' => wp_create_nonce( 'wpam_toggle_watchlist' ),
                'watchlist_get_nonce' => wp_create_nonce( 'wpam_get_watchlist' ),
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
                'get_messages_nonce' => wp_create_nonce( 'wpam_get_messages' ),
            ]
        );

        wp_register_script(
            'wpam-react-app',
            WPAM_PLUGIN_URL . 'public/js/react/auction-app.js',
            [ 'wp-element', 'wp-api-fetch' ],
            WPAM_PLUGIN_VERSION,
            true
        );
        wp_localize_script(
            'wpam-react-app',
            'wpamReactData',
            [
                'ajax_url'        => admin_url( 'admin-ajax.php' ),
                'bid_nonce'       => wp_create_nonce( 'wpam_place_bid' ),
                'watchlist_nonce' => wp_create_nonce( 'wpam_toggle_watchlist' ),
                'message_nonce'   => wp_create_nonce( 'wpam_submit_question' ),
                'get_messages_nonce' => wp_create_nonce( 'wpam_get_messages' ),
                'highest_nonce'   => wp_create_nonce( 'wpam_get_highest_bid' ),
                'pusher_enabled'  => $pusher_enabled,
                'pusher_key'      => get_option( 'wpam_pusher_key' ),
                'pusher_cluster'  => get_option( 'wpam_pusher_cluster' ),
                'pusher_channel'  => 'wpam-auctions',
            ]
        );
    }

    public function render_react_app( $atts = [] ) {
        $auction_id = 0;

        if ( ! empty( $atts['auction'] ) ) {
            $auction_id = absint( $atts['auction'] );
        } elseif ( is_singular( 'product' ) ) {
            $product = wc_get_product( get_the_ID() );
            if ( $product && 'auction' === $product->get_type() ) {
                $auction_id = get_the_ID();
            }
        }

        wp_enqueue_script( 'wpam-react-app' );
        wp_localize_script( 'wpam-react-app', 'wpamReactPage', [ 'auction_id' => $auction_id ] );

        return '<div id="wpam-react-root"></div>';
    }

    public function render_auction_meta() {
        global $product;
        $auction_id = $product->get_id();
        $end = get_post_meta( $auction_id, '_auction_end', true );
        $end_ts = $end ? strtotime( $end ) : 0;
        $type = get_post_meta( $auction_id, '_auction_type', true );
        $status = 'ongoing';
        $now = current_time( 'timestamp' );
        $start = get_post_meta( $auction_id, '_auction_start', true );
        $start_ts = $start ? strtotime( $start ) : 0;
        if ( $now < $start_ts ) {
            $status = 'scheduled';
        } elseif ( $now > $end_ts ) {
            $status = 'ended';
        }

        global $wpdb;
        $highest = $wpdb->get_var( $wpdb->prepare( "SELECT MAX(bid_amount) FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id ) );
        $highest = $highest ? floatval( $highest ) : 0;

        echo '<p class="wpam-status woocommerce-message">' . esc_html( ucfirst( $status ) ) . '</p>';
        echo '<p class="wpam-type">' . esc_html( ucfirst( $type ) ) . '</p>';
        echo '<p class="wpam-countdown" data-end="' . esc_attr( $end_ts ) . '"></p>';
        echo '<p>' . esc_html__( 'Current Bid:', 'wpam' ) . ' <span class="wpam-current-bid" data-auction-id="' . esc_attr( $auction_id ) . '">' . esc_html( $highest ) . '</span></p>';
    }

    public function render_bid_form() {
        global $product;
        echo '<form class="wpam-bid-form">';
        echo '<input type="number" step="0.01" class="wpam-bid-input" />';
        wp_nonce_field( 'wpam_place_bid', 'wpam_bid_nonce', false );
        echo '<button class="button wpam-bid-button" data-auction-id="' . esc_attr( $product->get_id() ) . '">' . esc_html__( 'Place Bid', 'wpam' ) . '</button>';
        echo '</form>';
    }

    public function render_watchlist_button() {
        global $product;
        wp_nonce_field( 'wpam_toggle_watchlist', 'wpam_watchlist_nonce', false );
        echo '<button class="button wpam-watchlist-button" data-auction-id="' . esc_attr( $product->get_id() ) . '">' . esc_html__( 'Toggle Watchlist', 'wpam' ) . '</button>';
    }

    public function render_messages() {
        global $product;
        echo '<div class="wpam-messages">';
        echo '<h2>' . esc_html__( 'Questions & Answers', 'wpam' ) . '</h2>';
        echo '<div class="wpam-messages-list"></div>';
        if ( is_user_logged_in() ) {
            echo '<textarea class="wpam-message-input" rows="3"></textarea>';
            wp_nonce_field( 'wpam_submit_question', 'wpam_message_nonce', false );
            echo '<button class="wpam-message-button" data-auction-id="' . esc_attr( $product->get_id() ) . '">' . esc_html__( 'Submit Question', 'wpam' ) . '</button>';
        } else {
            echo '<p>' . esc_html__( 'Please login to ask a question.', 'wpam' ) . '</p>';
        }
        echo '</div>';
    }
}
