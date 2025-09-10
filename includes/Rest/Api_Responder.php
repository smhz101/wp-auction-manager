<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest;

use WP_Error;
use WP_REST_Response;
use WPAM\Includes\Support\Exceptions\Rest_Exception;

final class Api_Responder {

	/**
	 * Normalize success payload to WP_REST_Response and set status.
	 *
	 * @param mixed $data
	 * @param int   $status
	 * @return WP_REST_Response
	 */
	public static function success( $data, $status = 200 ) {
		$response = rest_ensure_response( $data );
		if ( $response instanceof WP_REST_Response ) {
			$response->set_status( (int) $status );
		}
		return $response;
	}

	/**
	 * Convert Throwable → WP_Error with a proper HTTP status.
	 *
	 * @param \Throwable $e
	 * @return WP_Error
	 */
	public static function error( \Throwable $e ) {
		if ( $e instanceof Rest_Exception ) {
			return new WP_Error(
				$e->get_error_code(),
				$e->getMessage(),
				array_merge( array( 'status' => $e->get_status() ), $e->get_data() )
			);
		}

		// Don't leak internals on unexpected failures.
		error_log( sprintf( 'WPAM REST exception: %s in %s:%d', $e->getMessage(), $e->getFile(), $e->getLine() ) );

		return new WP_Error(
			'wpam_server_error',
			__( 'An unexpected error occurred.', 'wp-auction-manager' ),
			array( 'status' => 500 )
		);
	}
}
