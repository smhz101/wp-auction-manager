<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;

use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Services\Role_Service;
use WPAM\Includes\Services\User_Service;
use WPAM\Includes\Services\Capability_Service;
use WPAM\Includes\Services\Provenance_Service;
use WPAM\Includes\Support\Exceptions\Rest_Exception;

class Roles_Controller extends Base_Controller {

	/** @var Role_Service */
	protected $roles;

	/** @var Capability_Service */
	protected $caps;

	/** @var User_Service */
	protected $users;

	public function __construct() {
		$prov       	= new Provenance_Service();
		$this->roles 	= new Role_Service( $prov );
		$this->caps  	= new Capability_Service( $prov );
		$this->users 	= new User_Service();
	}

	public function register_routes() {
		
		// GET /roles/boot  => roles + caps + users (paged)
		$this->route(
			'/roles/boot',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'boot' ),
				'permission_callback' => array( $this, 'check_admin_permissions' ),
				'args'                => array(
					'paged'    => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
						'default'           => 1,
					),
					'per_page' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
						'default'           => 50,
					),
					'search'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// POST /roles
		$this->route(
			'/roles',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		// POST /roles/{slug}
		$this->route(
			'/roles/(?P<slug>[\w\-]+)',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		// POST /roles/{slug}
		$this->route(
			'/roles/(?P<slug>[\w\-]+)',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		// POST /roles/{slug}/duplicate
		$this->route(
			'/roles/(?P<slug>[\w\-]+)/duplicate',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'duplicate' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public function can_read() {
		$this->require_logged_in();
		return current_user_can( 'list_users' ) || current_user_can( 'manage_options' );
	}

	/**
	 * @param WP_REST_Request $req
	 * @return bool
	 */
	public function can_write( $req ) {
		$this->require_logged_in();
		$this->require_rest_nonce( $req );
		return current_user_can( 'promote_users' ) || current_user_can( 'manage_options' );
	}

	/**
	 * Boot data for roles admin page.
	 *
	 * @param WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function boot( \WP_REST_Request $request ) {
		try {
			$paged    = max( 1, (int) $request->get_param( 'paged' ) );
			$per_page = max( 1, (int) $request->get_param( 'per_page' ) );
			$search   = (string) ( $request->get_param( 'search' ) ?? '' );

			$roles = $this->roles->get_all_roles();
			$caps  = $this->caps->get_catalog();
			$users = $this->users->list_users( $paged, $per_page, $search );

			return rest_ensure_response( array(
				'roles'        => $roles,
				'capabilities' => $caps,
				'users'        => $users['users'],
				'usersTotal'   => $users['total'],
			) );
		} catch ( \Throwable $e ) {
			throw new Rest_Exception( 'wpam_boot_error', $e->getMessage(), 500 );
		}
	}

	/**
	 * Create a new role.
	 *
	 * @param WP_REST_Request $req
	 * @return array
	 * @throws Rest_Exception
	 */
	public function create( WP_REST_Request $req ) {
		$slug = sanitize_key( (string) $req->get_param( 'slug' ) );
		$name = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$capabilities = $req->get_param( 'capabilities' );
		$capabilities = is_array( $capabilities ) ? array_map( 'sanitize_key', $capabilities ) : array();

		if ( empty( $slug ) || empty( $name ) ) {
			throw new Rest_Exception( 'wpam_invalid', __( 'Missing role slug or name.', 'wpam' ), 400 );
		}

		$res = $this->roles->create_role( $slug, $name, $capabilities );
		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data(); $status = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 400;
			throw new Rest_Exception( $res->get_error_code() ?: 'wpam_error', $res->get_error_message(), $status );
		}

		// Return the created role with full shape.
		foreach ( $this->roles->get_all_roles() as $r ) {
			if ( $r['slug'] === $slug ) { return $r; }
		}

		throw new Rest_Exception( 'wpam_unknown', __( 'Failed to create role.', 'wpam' ), 500 );
	}

	/**
	 * Update an existing role.
	 *
	 * @param WP_REST_Request $req
	 * @return array
	 * @throws Rest_Exception
	 */
	public function update( WP_REST_Request $req ) {
		$slug   = sanitize_key( $req->get_param( 'slug' ) );
		$fields = $req->get_json_params();
		if ( empty( $slug ) ) {
			throw new Rest_Exception( 'wpam_invalid', __( 'Missing role slug.', 'wpam' ), 400 );
		}

		$res = $this->roles->update_role( $slug, is_array( $fields ) ? $fields : array() );
		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data(); $status = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 400;
			throw new Rest_Exception( $res->get_error_code() ?: 'wpam_error', $res->get_error_message(), $status );
		}

		foreach ( $this->roles->get_all_roles() as $r ) {
			if ( $r['slug'] === $slug ) { return $r; }
		}
		throw new Rest_Exception( 'wpam_unknown', __( 'Failed to update role.', 'wpam' ), 500 );
	}

	public function delete( WP_REST_Request $req ) {
		$slug = sanitize_key( $req->get_param( 'slug' ) );
		if ( empty( $slug ) ) {
			throw new Rest_Exception( 'wpam_invalid', __( 'Missing role slug.', 'wpam' ), 400 );
		}
		$res = $this->roles->delete_role( $slug );
		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data(); $status = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 400;
			throw new Rest_Exception( $res->get_error_code() ?: 'wpam_error', $res->get_error_message(), $status );
		}
		return array( 'ok' => true );
	}

	public function duplicate( WP_REST_Request $req ) {
		$slug = sanitize_key( (string) $req->get_param( 'slug' ) );
		if ( empty( $slug ) ) {
			throw new Rest_Exception( 'wpam_invalid', __( 'Missing role slug.', 'wpam' ), 400 );
		}
		$res = $this->roles->duplicate_role( $slug );
		if ( is_wp_error( $res ) ) {
			$data = $res->get_error_data(); $status = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 400;
			throw new Rest_Exception( $res->get_error_code() ?: 'wpam_error', $res->get_error_message(), $status );
		}

		$new_slug = is_string( $res ) ? $res : '';
		foreach ( $this->roles->get_all_roles() as $r ) {
			if ( $r['slug'] === $new_slug ) { return $r; }
		}
		throw new Rest_Exception( 'wpam_unknown', __( 'Failed to duplicate role.', 'wpam' ), 500 );
	}
}
