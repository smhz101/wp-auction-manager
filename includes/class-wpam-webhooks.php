<?php
/**
 * Webhook handlers.
 *
 * @package WP_Auction_Manager
 */

namespace WPAM\Includes;

/**
 * Send webhook calls on key auction events.
 */
class WPAM_Webhooks {
	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wpam_auction_end', array( $this, 'send_auction_end' ), 20, 1 );
	}

	/**
	 * Triggered when an auction ends.
	 *
	 * @param int $auction_id Auction post ID.
	 */
	public function send_auction_end( $auction_id ) {
		$url = trim( get_option( 'wpam_webhook_url', '' ) );
		if ( empty( $url ) ) {
			return;
		}

		$payload = array(
			'event'      => 'auction_end',
			'auction_id' => $auction_id,
		);

		$args     = array(
			'body'    => wp_json_encode( $payload ),
			'headers' => array( 'Content-Type' => 'application/json' ),
			'timeout' => 5,
		);
		$response = wp_remote_post( $url, $args );

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) < 200 || wp_remote_retrieve_response_code( $response ) >= 300 ) {
			error_log( 'WPAM webhook call failed: ' . ( is_wp_error( $response ) ? $response->get_error_message() : wp_remote_retrieve_body( $response ) ) );

			// Retry once on failure.
			$response = wp_remote_post( $url, $args );
			if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) < 200 || wp_remote_retrieve_response_code( $response ) >= 300 ) {
				error_log( 'WPAM webhook retry failed: ' . ( is_wp_error( $response ) ? $response->get_error_message() : wp_remote_retrieve_body( $response ) ) );
			}
		}
	}
}
