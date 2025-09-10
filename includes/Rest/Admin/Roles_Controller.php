<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Not_Found_Exception;
use WPAM\Includes\Support\Exceptions\Validation_Exception;

final class Roles_Controller extends Base_Controller {

	const OPT_ROLES = 'wpam_roles';

	public function register_routes() {
		$this->route(
			'/roles',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list' ),
				'permission_callback' => array( $this, 'can_read' ),
			)
		);

		$this->route(
			'/roles',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		$this->route(
			'/roles/(?P<slug>[\w\-]+)',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		$this->route(
			'/roles/(?P<slug>[\w\-]+)',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		$this->route(
			'/roles/(?P<slug>[\w\-]+)/duplicate',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'duplicate' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);
	}

	public function can_read() {
		$this->require_logged_in();
		return current_user_can( 'list_users' ) || current_user_can( 'manage_options' );
	}

	public function can_write( $req ) {
		$this->require_logged_in();
		$this->require_rest_nonce( $req );
		return current_user_can( 'promote_users' ) || current_user_can( 'manage_options' );
	}

	public function list() {
		$roles = get_option( self::OPT_ROLES, array() );
		return is_array( $roles ) ? array_values( $roles ) : array();
	}

	public function create( WP_REST_Request $req ) {
		$body = (array) $req->get_json_params();
		$name = isset( $body['name'] ) ? sanitize_text_field( (string) $body['name'] ) : '';
		$slug = isset( $body['slug'] ) ? sanitize_key( (string) $body['slug'] ) : '';
		$caps = isset( $body['capabilities'] ) && is_array( $body['capabilities'] ) ? array_map( 'sanitize_text_field', $body['capabilities'] ) : array();

		if ( '' === $name || '' === $slug ) {
			throw new Validation_Exception( __( 'Role name and slug are required.', 'wp-auction-manager' ) );
		}

		$roles = $this->get_roles_map();
		if ( isset( $roles[ $slug ] ) ) {
			throw new Validation_Exception( __( 'Role slug already exists.', 'wp-auction-manager' ) );
		}

		$roles[ $slug ] = array(
			'id'           => $slug,
			'name'         => $name,
			'slug'         => $slug,
			'capabilities' => array_values( array_unique( $caps ) ),
			'usersCount'   => 0,
			'isSystem'     => false,
		);

		update_option( self::OPT_ROLES, $roles, false );

		return $roles[ $slug ];
	}

	public function update( WP_REST_Request $req ) {
		$slug  = sanitize_key( (string) $req['slug'] );
		$roles = $this->get_roles_map();
		if ( ! isset( $roles[ $slug ] ) ) {
			throw new Not_Found_Exception( __( 'Role not found.', 'wp-auction-manager' ) );
		}
		if ( ! empty( $roles[ $slug ]['isSystem'] ) ) {
			throw new Validation_Exception( __( 'System roles cannot be edited.', 'wp-auction-manager' ) );
		}

		$body = (array) $req->get_json_params();
		if ( isset( $body['name'] ) ) {
			$roles[ $slug ]['name'] = sanitize_text_field( (string) $body['name'] );
		}
		if ( isset( $body['capabilities'] ) && is_array( $body['capabilities'] ) ) {
			$roles[ $slug ]['capabilities'] = array_values(
				array_unique( array_map( 'sanitize_text_field', $body['capabilities'] ) )
			);
		}

		update_option( self::OPT_ROLES, $roles, false );
		return $roles[ $slug ];
	}

	public function delete( WP_REST_Request $req ) {
		$slug  = sanitize_key( (string) $req['slug'] );
		$roles = $this->get_roles_map();

		if ( ! isset( $roles[ $slug ] ) ) {
			throw new Not_Found_Exception( __( 'Role not found.', 'wp-auction-manager' ) );
		}
		if ( ! empty( $roles[ $slug ]['isSystem'] ) ) {
			throw new Validation_Exception( __( 'System roles cannot be deleted.', 'wp-auction-manager' ) );
		}
		if ( ! empty( $roles[ $slug ]['usersCount'] ) ) {
			throw new Validation_Exception( __( 'Role has assigned users.', 'wp-auction-manager' ) );
		}

		unset( $roles[ $slug ] );
		update_option( self::OPT_ROLES, $roles, false );

		return array( 'deleted' => true );
	}

	public function duplicate( WP_REST_Request $req ) {
		$slug  = sanitize_key( (string) $req['slug'] );
		$roles = $this->get_roles_map();
		if ( ! isset( $roles[ $slug ] ) ) {
			throw new Not_Found_Exception( __( 'Role not found.', 'wp-auction-manager' ) );
		}

		$src = $roles[ $slug ];
		$i   = 2;
		$dup = $slug . '-copy';
		while ( isset( $roles[ $dup ] ) ) {
			$dup = $slug . '-copy-' . $i++;
		}

		$roles[ $dup ] = array(
			'id'           => $dup,
			'name'         => $src['name'] . ' Copy',
			'slug'         => $dup,
			'capabilities' => isset( $src['capabilities'] ) ? array_values( $src['capabilities'] ) : array(),
			'usersCount'   => 0,
			'isSystem'     => false,
		);

		update_option( self::OPT_ROLES, $roles, false );
		return $roles[ $dup ];
	}

	private function get_roles_map() {
		$roles = get_option( self::OPT_ROLES, array() );
		return is_array( $roles ) ? $roles : array();
	}
}
