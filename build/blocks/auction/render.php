<?php
use WPAM\Includes\WPAM_HTML;

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Server-rendered Auction Block.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (null for dynamic blocks).
 * @var WP_Block $block      Block object instance.
 */

$atts = wp_parse_args(
    $attributes,
    [
        'auctionId'     => 0,
        'showCountdown' => true,
        'showBidForm'   => true,
        'showStatus'    => true,
        'showWatchlist' => true,
    ]
);

$auction_id = absint( $atts['auctionId'] );

if ( ! $auction_id ) {
    global $post;
    $product = wc_get_product( $post ? $post->ID : 0 );
    if ( $product && $product->get_type() === 'auction' ) {
        $auction_id = $product->get_id();
    } else {
        return;
    }
}

echo WPAM_HTML::render_auction_meta( $auction_id, $atts );