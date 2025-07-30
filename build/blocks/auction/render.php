<?php
/**
 * Render callback for the Auction block.
 *
 * @param array $attributes Block attributes from the editor.
 * @return string HTML output for the block.
 */
return function( $attributes ) {
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
};

