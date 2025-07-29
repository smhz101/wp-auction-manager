<?php
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

                $custom = WPAM_PLUGIN_DIR . 'templates/single-auction.php';
                return file_exists( $custom ) ? $custom : $template;
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
}
