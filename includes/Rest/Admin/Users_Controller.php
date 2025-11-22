<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WP_User_Query;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Services\User_Service;
use WPAM\Includes\Support\Exceptions\Validation_Exception;

class Users_Controller extends Base_Controller {

	/** @var User_Service */
	protected $users;

	public function __construct() {
		$this->users = new User_Service();
	}

	public function register_routes() {
		// List WP users with attached wpam role slugs.
		$this->route(
			'/users',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list' ),
				'permission_callback' => array( $this, 'can_read' ),
				'args'                => array(
					'search'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'role'     => array( 'sanitize_callback' => 'sanitize_key' ),
					'page'     => array( 'validate_callback' => 'is_numeric' ),
					'per_page' => array( 'validate_callback' => 'is_numeric' ),
				),
			)
		);

		// Bulk assign/remove plugin roles to WP users.
		$this->route(
			'/users/roles',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'assign_roles' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		// Replace a single user's role set.
		$this->route(
			'/users/(?P<id>\d+)/roles',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'replace_roles' ),
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

	public function list( WP_REST_Request $req ) {
		$page     = max( 1, (int) $req->get_param( 'page' ) );
		$per_page = max( 1, (int) $req->get_param( 'per_page' ) );
		$search   = (string) $req->get_param( 'search' );
		$role     = (string) $req->get_param( 'role' );

		$args = array(
			'number' => $per_page ? $per_page : 20,
			'paged'  => $page,
			'fields' => array( 'ID', 'display_name', 'user_email', 'user_login' ),
		);

		if ( $search ) {
			$args['search']         = '*' . esc_attr( $search ) . '*';
			$args['search_columns'] = array( 'user_login', 'user_nicename', 'user_email', 'display_name' );
		}

		$q    = new WP_User_Query( $args );
		$list = array();

		foreach ( (array) $q->get_results() as $u ) {
			$roles = get_user_meta( (int) $u->ID, '_wpam_roles', true );
			if ( $role && ( empty( $roles ) || ! in_array( $role, (array) $roles, true ) ) ) {
				continue;
			}
			$list[] = array(
				'id'          => (int) $u->ID,
				'username'    => $u->user_login,
				'displayName' => $u->display_name,
				'email'       => $u->user_email,
				'roles'       => is_array( $roles ) ? array_values( $roles ) : array(),
			);
		}

		return array(
			'total' => (int) $q->get_total(),
			'rows'  => $list,
		);
	}

	public function assign_roles( WP_REST_Request $req ) {
		$body = (array) $req->get_json_params();

		$ids = isset( $body['userIds'] ) && is_array( $body['userIds'] ) ? array_map( 'intval', $body['userIds'] ) : array();
		$add = isset( $body['add'] ) && is_array( $body['add'] ) ? array_map( 'sanitize_key', $body['add'] ) : array();
		$rem = isset( $body['remove'] ) && is_array( $body['remove'] ) ? array_map( 'sanitize_key', $body['remove'] ) : array();

		if ( empty( $ids ) ) {
			throw new Validation_Exception( __( 'No users selected.', 'wp-auction-manager' ) );
		}

		$roles_map = get_option( Roles_Controller::OPT_ROLES, array() );
		foreach ( $add as $slug ) {
			if ( ! isset( $roles_map[ $slug ] ) ) {
				throw new Validation_Exception( sprintf( __( 'Unknown role: %s', 'wp-auction-manager' ), $slug ) );
			}
		}

		$delta = array(); // slug => +/- count

		foreach ( $ids as $uid ) {
			$current = get_user_meta( $uid, '_wpam_roles', true );
			$current = is_array( $current ) ? $current : array();
			$before  = $current;

			if ( ! empty( $add ) ) {
				$current = array_values( array_unique( array_merge( $current, $add ) ) );
			}
			if ( ! empty( $rem ) ) {
				$current = array_values( array_filter( $current, function( $r ) use ( $rem ) {
					return ! in_array( $r, $rem, true );
				} ) );
			}

			update_user_meta( $uid, '_wpam_roles', $current );

			$gained = array_diff( $current, $before );
			$lost   = array_diff( $before, $current );

			foreach ( $gained as $slug ) { $delta[ $slug ] = isset( $delta[ $slug ] ) ? $delta[ $slug ] + 1 : 1; }
			foreach ( $lost as $slug )   { $delta[ $slug ] = isset( $delta[ $slug ] ) ? $delta[ $slug ] - 1 : -1; }
		}

		// Update role user counts.
		if ( ! empty( $delta ) ) {
			$roles = get_option( Roles_Controller::OPT_ROLES, array() );
			if ( is_array( $roles ) ) {
				foreach ( $delta as $slug => $d ) {
					if ( isset( $roles[ $slug ] ) ) {
						$roles[ $slug ]['usersCount'] = max(
							0,
							(int) ( isset( $roles[ $slug ]['usersCount'] ) ? $roles[ $slug ]['usersCount'] : 0 ) + (int) $d
						);
					}
				}
				update_option( Roles_Controller::OPT_ROLES, $roles, false );
			}
		}

		return array( 'ok' => true );
	}

	public function replace_roles( WP_REST_Request $req ) {
		$user_id = (int) $req['id'];
		$body    = (array) $req->get_json_params();
		$roles   = isset( $body['roles'] ) && is_array( $body['roles'] ) ? array_map( 'sanitize_key', $body['roles'] ) : array();

		if ( $user_id <= 0 ) {
			throw new Validation_Exception( __( 'Invalid user id.', 'wp-auction-manager' ) );
		}

		// Optional: validate against roles registry.
		$map = get_option( Roles_Controller::OPT_ROLES, array() );
		foreach ( $roles as $slug ) {
			if ( ! isset( $map[ $slug ] ) ) {
				throw new Validation_Exception( sprintf( __( 'Unknown role: %s', 'wp-auction-manager' ), $slug ) );
			}
		}

		$before = get_user_meta( $user_id, '_wpam_roles', true );
		$before = is_array( $before ) ? $before : array();

		update_user_meta( $user_id, '_wpam_roles', array_values( array_unique( $roles ) ) );

		// Adjust counts.
		$gained = array_diff( $roles, $before );
		$lost   = array_diff( $before, $roles );

		if ( ! empty( $gained ) || ! empty( $lost ) ) {
			$roles_opt = get_option( Roles_Controller::OPT_ROLES, array() );
			if ( is_array( $roles_opt ) ) {
				foreach ( $gained as $slug ) {
					if ( isset( $roles_opt[ $slug ] ) ) {
						$roles_opt[ $slug ]['usersCount'] = max( 0, (int) ( $roles_opt[ $slug ]['usersCount'] ?? 0 ) + 1 );
					}
				}
				foreach ( $lost as $slug ) {
					if ( isset( $roles_opt[ $slug ] ) ) {
						$roles_opt[ $slug ]['usersCount'] = max( 0, (int) ( $roles_opt[ $slug ]['usersCount'] ?? 0 ) - 1 );
					}
				}
				update_option( Roles_Controller::OPT_ROLES, $roles_opt, false );
			}
		}

		return array( 'ok' => true );
	}
}
