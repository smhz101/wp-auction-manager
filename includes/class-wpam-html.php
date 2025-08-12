<?php

namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_HTML {
	/**
	 * Renders auction meta block HTML.
	 *
	 * @param int   $auction_id
	 * @param array $atts {
	 *     Optional. Rendering options.
	 *     @type bool $showStatus
	 *     @type bool $showCountdown
	 *     @type bool $showBidForm
	 *     @type bool $showWatchlist
	 *     @type bool $showWinner
	 * }
	 *
	 * @return string HTML output.
	 */
	public static function render_auction_meta( $auction_id, $atts = array() ) {
		$defaults = array(
			'showStatus'    => true,
			'showCountdown' => true,
			'showBidForm'   => true,
			'showWatchlist' => true,
			'showWinner'    => true,
		);
		$atts     = wp_parse_args( $atts, $defaults );

		$start    = get_post_meta( $auction_id, '_auction_start', true );
		$start_ts = $start ? ( new \DateTimeImmutable( $start, new \DateTimeZone( 'UTC' ) ) )->getTimestamp() : 0;
		$end      = get_post_meta( $auction_id, '_auction_end', true );
		$end_ts   = $end ? ( new \DateTimeImmutable( $end, new \DateTimeZone( 'UTC' ) ) )->getTimestamp() : 0;
		$type     = get_post_meta( $auction_id, '_auction_type', true );
		$status   = get_post_meta( $auction_id, '_auction_state', true );
		$now      = current_datetime()->getTimestamp();

		global $wpdb;
		$query   = ( 'reverse' === $type )
		? $wpdb->prepare( "SELECT MIN(bid_amount) FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id )
		: $wpdb->prepare( "SELECT MAX(bid_amount) FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id );
		$highest = $wpdb->get_var( $query );
		$highest = $highest ? ( function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $highest ) : $highest ) : 0;

		$silent          = ( 'sealed' === $type ) || ( get_option( 'wpam_enable_silent_bidding' ) && get_post_meta( $auction_id, '_auction_silent_bidding', true ) );
		$display_highest = ( $silent && $now < $end_ts ) ? __( 'Hidden', 'wpam' ) : wc_price( $highest );

		ob_start();
		echo '<div class="wpam-auction-block theme-1" data-status="' . esc_attr( $status ) . '" data-start="' . esc_attr( $start_ts ) . '" data-end="' . esc_attr( $end_ts ) . '">';

		if ( $atts['showStatus'] ) {
			echo '<p class="wpam-status auction-status">' . esc_html( ucfirst( $status ) ) . '</p>';
			echo '<p class="wpam-type">' . esc_html( ucfirst( $type ) ) . '</p>';
		}

		if ( $atts['showCountdown'] && ! in_array( $status, array( 'ended', 'canceled', 'suspended' ), true ) ) {
			echo '<p class="wpam-countdown" data-start="' . esc_attr( $start_ts ) . '" data-end="' . esc_attr( $end_ts ) . '" data-status="' . esc_attr( $status ) . '"></p>';
		}

		if ( 'live' === $status ) {
			$label = ( 'reverse' === $type ) ? __( 'Lowest Bid:', 'wpam' ) : __( 'Current Bid:', 'wpam' );
			echo '<p class="wpam-current-price">' . esc_html( $label ) .
			' <span class="wpam-current-bid" data-auction-id="' . esc_attr( $auction_id ) . '">' .
			esc_html( $display_highest ) . '</span></p>';
			echo '<div class="wpam-bid-status" data-auction-id="' . esc_attr( $auction_id ) . '"></div>';
			echo '<p>' . esc_html__( 'Viewers:', 'wpam' ) . ' <span class="wpam-viewer-count" data-auction-id="' . esc_attr( $auction_id ) . '">0</span></p>';
			echo '<p>' . esc_html__( 'Participants:', 'wpam' ) . ' <span class="wpam-participant-count" data-auction-id="' . esc_attr( $auction_id ) . '">0</span></p>';
		}

		$winner_id = (int) get_post_meta( $auction_id, '_auction_winner', true );
		if ( $atts['showWinner'] ) {
			if ( 'completed' === $status && $winner_id ) {
				$current_user_id = get_current_user_id();
				if ( $current_user_id === $winner_id ) {
					echo '<p class="wpam-auction-winner">' . esc_html__( 'You won this auction', 'wpam' ) . '</p>';
				} else {
					$user        = get_userdata( $winner_id );
					$name        = $user ? $user->display_name : '';
					$anon_name   = $name ? substr( $name, 0, 1 ) . str_repeat( '*', max( strlen( $name ) - 1, 0 ) ) : __( 'Unknown', 'wpam' );
					$winner_text = sprintf( __( 'Winner: %s', 'wpam' ), $anon_name );
					echo '<p class="wpam-auction-winner">' . esc_html( $winner_text ) . '</p>';
				}
			} elseif ( 'failed' === $status ) {
				echo '<p class="wpam-auction-winner">' . esc_html__( 'Auction ended without a winner', 'wpam' ) . '</p>';
			} elseif ( 'ended' === $status ) {
				echo '<p class="wpam-auction-winner">' . esc_html__( 'Processing results...', 'wpam' ) . '</p>';
			}
		}

		if ( 'live' === $status ) {
			if ( $atts['showBidForm'] ) {
				echo '<form class="wpam-bid-form">';
				echo '<input type="number" step="0.01" class="wpam-bid-input" />';
				wp_nonce_field( 'wpam_place_bid', 'wpam_bid_nonce', false );
				echo '<button class="button wpam-bid-button" data-auction-id="' . esc_attr( $auction_id ) . '">' .
				esc_html__( 'Place Bid', 'wpam' ) . '</button>';
				echo '</form>';
			}

			if ( $atts['showWatchlist'] ) {
				wp_nonce_field( 'wpam_toggle_watchlist', 'wpam_watchlist_nonce', false );
				echo '<button class="button wpam-watchlist-button" data-auction-id="' . esc_attr( $auction_id ) . '">' .
				esc_html__( 'Toggle Watchlist', 'wpam' ) . '</button>';
			}
		}

		echo '</div>';
		return ob_get_clean();
	}
}
