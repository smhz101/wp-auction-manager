<?php
namespace WPAM\Includes\Services;

if ( ! defined( 'ABSPATH' ) ) { exit; }

class User_Service {

	/**
	 * Page through users (for boot we may just return N users + totals).
	 *
	 * @return array { users: [], total: int }
	 */
	public function list_users( $paged = 1, $per_page = 50, $search = '' ) {
		$args = array(
			'number'  => max( 1, intval( $per_page ) ),
			'paged'   => max( 1, intval( $paged ) ),
			'orderby' => 'registered',
			'order'   => 'DESC',
			'fields'  => array( 'ID', 'user_email', 'display_name', 'user_registered', 'user_status' ),
		);

		if ( $search ) {
			$args['search'] = '*' . esc_attr( $search ) . '*';
		}

		$q = new \WP_User_Query( $args );
		$items = array();

		foreach ( $q->get_results() as $u ) {
			$roles = array_values( (array) get_user_meta( $u->ID, 'wp_capabilities', true ) );
			// WP stores caps as map role => bool under wp_capabilities; we’ll read keys instead:
			$role_keys = array();
			$raw = get_userdata( $u->ID );
			if ( $raw && is_array( $raw->roles ) ) {
				$role_keys = array_map( 'sanitize_key', $raw->roles );
			}

			$created_by = get_user_meta( $u->ID, 'wpam_created', true ) ? 'wpam' : 'core';

			$items[] = array(
				'id'        => (string) $u->ID,
				'email'     => (string) $u->user_email,
				'name'      => (string) $u->display_name,
				'status'    => intval( $u->user_status ) === 0 ? 'active' : 'disabled',
				'roles'     => $role_keys,
				'createdAt' => (string) $u->user_registered,
				'created_by'=> $created_by,
			);
		}

		return array(
			'users' => $items,
			'total' => intval( $q->get_total() ),
		);
	}

	public function assign_role( $role_slug, $user_ids ) {
		$role_slug = sanitize_key( $role_slug );
		$role = get_role( $role_slug );
		if ( ! $role ) {
			return new \WP_Error( 'wpam_role_not_found', __( 'Role not found.', 'wpam' ), array( 'status' => 404 ) );
		}
		foreach ( $user_ids as $id ) {
			$id = absint( $id );
			$user = get_user_by( 'id', $id );
			if ( $user ) { $user->add_role( $role_slug ); }
		}
		return true;
	}

	public function remove_role( $role_slug, $user_ids ) {
		$role_slug = sanitize_key( $role_slug );
		foreach ( $user_ids as $id ) {
			$id = absint( $id );
			$user = get_user_by( 'id', $id );
			if ( $user ) { $user->remove_role( $role_slug ); }
		}
		return true;
	}
}
