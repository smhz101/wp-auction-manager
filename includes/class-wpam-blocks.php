<?php
namespace WPAM\Includes;

class WPAM_Blocks {
    public function __construct() {
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_action( 'init', [ $this, 'register_patterns' ] );
    }

    public function register_blocks() {
        // Blocks are compiled to the build directory via `npm run build`.
        register_block_type(
            WPAM_PLUGIN_DIR . 'build/blocks/auction',
            [
                'render_callback' => [ $this, 'render_auction_block' ],
            ]
        );
    }

    public function register_patterns() {
        if ( function_exists( 'register_block_pattern' ) ) {
            $content = '';
            $file    = WPAM_PLUGIN_DIR . 'patterns/auction-details.php';
            if ( file_exists( $file ) ) {
                $content = include $file;
            }

            register_block_pattern(
                'wpam/auction-details',
                [
                    'title'       => __( 'Auction Details', 'wpam' ),
                    'description' => __( 'Display auction countdown, status and bid form.', 'wpam' ),
                    'content'     => $content,
                    'categories'  => [ 'featured' ],
                ]
            );
        }
    }

    public function render_auction_block( $attributes ) {
        $atts = wp_parse_args(
            $attributes,
            [
                'auctionId'     => 0,
                'showCountdown' => true,
                'showBidForm'   => true,
                'showStatus'    => true,
            ]
        );

        $auction_id = absint( $atts['auctionId'] );
        if ( ! $auction_id && is_singular( 'product' ) ) {
            $product = wc_get_product( get_queried_object_id() );
            if ( $product && 'auction' === $product->get_type() ) {
                $auction_id = $product->get_id();
            }
        }

        if ( ! $auction_id ) {
            return '';
        }

        $end    = get_post_meta( $auction_id, '_auction_end', true );
        $end_ts = $end ? strtotime( $end ) : 0;
        $type   = get_post_meta( $auction_id, '_auction_type', true );
        $status = get_post_meta( $auction_id, '_auction_state', true );

        global $wpdb;
        $highest = $wpdb->get_var( $wpdb->prepare( "SELECT MAX(bid_amount) FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id ) );
        $highest = $highest ? floatval( $highest ) : 0;

        ob_start();
        echo '<div class="wpam-auction-block">';
        if ( $atts['showStatus'] ) {
            echo '<p class="wpam-status woocommerce-message">' . esc_html( ucfirst( $status ) ) . '</p>';
            echo '<p class="wpam-type">' . esc_html( ucfirst( $type ) ) . '</p>';
        }
        if ( $atts['showCountdown'] ) {
            echo '<p class="wpam-countdown" data-end="' . esc_attr( $end_ts ) . '"></p>';
        }
        echo '<p>' . esc_html__( 'Current Bid:', 'wpam' ) . ' <span class="wpam-current-bid" data-auction-id="' . esc_attr( $auction_id ) . '">' . esc_html( $highest ) . '</span></p>';
        if ( $atts['showBidForm'] ) {
            echo '<form class="wpam-bid-form">';
            echo '<input type="number" step="0.01" class="wpam-bid-input" />';
            wp_nonce_field( 'wpam_place_bid', 'wpam_bid_nonce', false );
            echo '<button class="button wpam-bid-button" data-auction-id="' . esc_attr( $auction_id ) . '">' . esc_html__( 'Place Bid', 'wpam' ) . '</button>';
            echo '</form>';
        }
        echo '</div>';
        return ob_get_clean();
    }
}
