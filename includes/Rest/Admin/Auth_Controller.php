<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Nonce_Helper;
use WPAM\Includes\Domain\Current_User_Service;
use WPAM\Includes\Support\Exceptions\Forbidden_Exception;

class Auth_Controller extends Base_Controller {

  public function register_routes() {
		$this->route(
			'/nonce',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_nonce' ),
				'permission_callback' => array( $this, 'can_get_nonce' ),
			)
		);

    $this->route(
			'/me',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_me' ),
				'permission_callback' => array( $this, 'can_get_me' ),
			)
		);
	}

	/** Permission: must be logged in user with read access to admin. */
	public function can_get_nonce() {
		$this->require_logged_in();
		// Optional: tighten to users who can access dashboard.
		if ( ! current_user_can( 'read' ) ) {
			throw new Forbidden_Exception();
		}
		return true;
	}

	public function can_get_me() {
		$this->require_logged_in();
		if ( ! current_user_can( 'read' ) ) {
			throw new Forbidden_Exception();
		}
		return true;
	}
  /**
	 * GET /nonce
	 * Return a fresh REST nonce + metadata (ttl/expires_at).
	 */
	public function get_nonce( WP_REST_Request $request ): WP_REST_Response {
		$nonce  = Nonce_Helper::create_rest_nonce();
		$meta   = Nonce_Helper::get_metadata();
		$body   = array(
			'nonce'       => $nonce,
			'expires_in'  => $meta['expires_in'],
			'expires_at'  => $meta['expires_at'],
			'user_id'     => get_current_user_id(),
			'user_login'  => wp_get_current_user()->user_login,
		);
		return rest_ensure_response( $body );
	}

	/**
	 * GET /me
	 * Return a minimal snapshot of the current user.
	 */
	public function get_me( WP_REST_Request $request ): WP_REST_Response {
		$svc  = new Current_User_Service();
		$data = $svc->snapshot();
		return rest_ensure_response( $data );
	}
}