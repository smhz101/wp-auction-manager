<?php
declare(strict_types=1);

namespace WPAM\Includes\Support;

/**
 * Nonce helper for REST context.
 */
final class Nonce_Helper {

	/**
	 * Create a REST nonce (same action core uses for REST).
	 */
	public static function create_rest_nonce(): string {
		return wp_create_nonce( 'wp_rest' );
	}

	/**
	 * Provide metadata about nonce lifetime.
	 * Note: WP internally validates nonces in ticks (~12h windows),
	 * but exposed "life" is the filterable `nonce_life` (default 24h).
	 */
	public static function get_metadata(): array {
		$life       = (int) apply_filters( 'nonce_life', DAY_IN_SECONDS );
		$now        = time();
		$expires_in = max( 60, $life ); // lower bound 60s.
		$expires_at = gmdate( 'c', $now + $expires_in );

		return array(
			'expires_in' => $expires_in,
			'expires_at' => $expires_at,
		);
	}
}
