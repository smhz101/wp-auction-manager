<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Forbidden_Exception;

class Auctions_Controller extends Base_Controller {

	/** e.g. /wp-json/wpam/v1/admin/auctions */
	public function register_routes() {
		$this->route(
			'/admin/auctions',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'index' ),
				'permission_callback' => array( $this, 'can_index' ),
				'args'                => array(
					'search'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'status'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'type'     => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'page'     => array( 'validate_callback' => 'is_numeric' ),
					'per_page' => array( 'validate_callback' => 'is_numeric' ),
				),
			)
		);
	}

	/** Only admins (or capability you prefer) may list admin auctions. */
	public function can_index() {
		$this->require_logged_in();
		if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'manage_options' ) ) {
			throw new Forbidden_Exception();
		}
		return true;
	}

	/**
	 * Controller action: list auctions.
	 * Move your previous query code here (or call a separate service).
	 *
	 * @return array|\WP_REST_Response
	 */
	public function index( WP_REST_Request $request ) {
		// Minimal example – replace with your existing query logic.
		// Returning a consistent shape: { total, data: [] }
		return array(
			'total' => 0,
			'data'  => array(),
		);
	}
}
