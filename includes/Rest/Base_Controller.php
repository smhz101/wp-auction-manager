<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest;

use WP_Error;
use WP_REST_Request;
use WPAM\Includes\Support\Exceptions\Rest_Exception;
use WPAM\Includes\Support\Exceptions\Unauthorized_Exception;

abstract class Base_Controller {

	/** @var string */
	protected $namespace = 'wpam/v1';

	/** Register all routes for this controller. */
	abstract public function register_routes();

	/**
	 * Helper to call register_rest_route() with safe wrappers.
	 *
	 * @param string $route e.g. '/admin/auctions'
	 * @param array  $args  Single or multiple method defs.
	 * @return void
	 */
	protected function route( $route, array $args ) {
		$defs = ( isset( $args[0] ) && is_array( $args[0] ) ) ? $args : array( $args );

		foreach ( $defs as &$def ) {
			if ( isset( $def['callback'] ) && is_callable( $def['callback'] ) ) {
				$def['callback'] = $this->wrap( $def['callback'] );
			}
			if ( isset( $def['permission_callback'] ) && is_callable( $def['permission_callback'] ) ) {
				$def['permission_callback'] = $this->wrap_permission( $def['permission_callback'] );
			} else {
				$def['permission_callback'] = '__return_true';
			}
		}
		unset( $def );

		register_rest_route( $this->namespace, $route, $defs );
	}

	/** Wrap main callback: try/catch → Api_Responder. */
	protected function wrap( $cb ) {
		return function( WP_REST_Request $request ) use ( $cb ) {
			try {
				$result = call_user_func( $cb, $request );
				// Controllers may return arrays or WP_REST_Response.
				return Api_Responder::success( $result );
			} catch ( \Throwable $e ) {
				return Api_Responder::error( $e );
			}
		};
	}

	/** Wrap permission callback so it can throw Rest_Exception. */
	protected function wrap_permission( $cb ) {
		return function( WP_REST_Request $request ) use ( $cb ) {
			try {
				$ok = call_user_func( $cb, $request );
				return ( true === $ok ) ? true : $ok;
			} catch ( Rest_Exception $e ) {
				return Api_Responder::error( $e );
			} catch ( \Throwable $e ) {
				return Api_Responder::error( new Unauthorized_Exception() );
			}
		};
	}

	/** Common guard */
	protected function require_logged_in() {
		if ( ! is_user_logged_in() ) {
			throw new Unauthorized_Exception();
		}
	}

	/**
	 * Enforce X-WP-Nonce for mutating methods (optional but recommended).
	 * Call this in permission callbacks for POST/PUT/PATCH/DELETE.
	 */
	protected function require_rest_nonce( WP_REST_Request $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			throw new Unauthorized_Exception( __( 'Invalid or missing nonce.', 'wp-auction-manager' ) );
		}
	}

	/**
	 * Permission check for admin-only endpoints.
	 *
	 * @return bool|WP_Error
	 */
	public function check_admin_permissions() {
		$this->require_logged_in();
		
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 'wpam_forbidden', __( 'Insufficient permissions.', 'wpam' ), array( 'status' => 403 ) );
		}
		return true;
	}
}
