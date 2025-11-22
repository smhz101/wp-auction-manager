<?php
namespace WPAM\Includes\Services;

if ( ! defined( 'ABSPATH' ) ) { exit; }

class Role_Service {

	/** @var Provenance_Service */
	protected $prov;

	public function __construct( Provenance_Service $prov ) {
		$this->prov = $prov;
	}

	/**
	 * List all roles with usersCount and source flag.
	 *
	 * @return array
	 */
	public function get_all_roles() {
		global $wp_roles;
		if ( ! isset( $wp_roles ) ) {
			$wp_roles = wp_roles();
		}

		$out = array();
		$editable = $wp_roles->roles;

		foreach ( $editable as $slug => $data ) {
			$users_count = count_users();
			$count = 0;
			if ( isset( $users_count['avail_roles'][ $slug ] ) ) {
				$count = intval( $users_count['avail_roles'][ $slug ] );
			}

			$source = $this->prov->role_source( $slug );

			$out[] = array(
				'id'           => $slug, // role id == slug in WP
				'name'         => isset( $data['name'] ) ? (string) $data['name'] : ucfirst( $slug ),
				'slug'         => (string) $slug,
				'description'  => '',
				'isSystem'     => ( $source === 'core' ),
				'usersCount'   => $count,
				'capabilities' => isset( $data['capabilities'] ) && is_array( $data['capabilities'] )
					? array_keys( array_filter( $data['capabilities'] ) )
					: array(),
				'source'       => $source,
			);
		}

		// Sort core first
		usort( $out, function( $a, $b ) {
			if ( $a['isSystem'] === $b['isSystem'] ) { return strcmp( $a['name'], $b['name'] ); }
			return $a['isSystem'] ? -1 : 1;
		} );

		return $out;
	}

	/**
	 * Create a role and register in plugin registry.
	 */
	public function create_role( $slug, $name, $caps = array() ) {
		$slug = sanitize_key( $slug );
		$name = sanitize_text_field( $name );
		$caps = is_array( $caps ) ? array_map( 'sanitize_key', $caps ) : array();

		$mapped = array();
		foreach ( $caps as $cap ) { $mapped[ $cap ] = true; }

		$result = add_role( $slug, $name, $mapped );
		if ( null === $result ) {
			return new \WP_Error( 'wpam_role_exists', __( 'Role already exists.', 'wpam' ), array( 'status' => 409 ) );
		}

		$this->prov->register_role( $slug );
		return $slug;
	}

	/**
	 * Update role caps (rename in WP is not supported, so we amend caps).
	 */
	public function update_role( $slug, $fields ) {
		$slug = sanitize_key( $slug );
		$role = get_role( $slug );
		if ( ! $role ) {
			return new \WP_Error( 'wpam_role_not_found', __( 'Role not found.', 'wpam' ), array( 'status' => 404 ) );
		}

		if ( isset( $fields['capabilities'] ) && is_array( $fields['capabilities'] ) ) {
			$new_caps = array_map( 'sanitize_key', $fields['capabilities'] );

			// Remove old caps not present
			foreach ( array_keys( $role->capabilities ) as $cap ) {
				if ( ! in_array( $cap, $new_caps, true ) ) {
					$role->remove_cap( $cap );
				}
			}
			// Add new caps
			foreach ( $new_caps as $cap ) {
				$role->add_cap( $cap, true );
			}
		}

		// Name "label" change is not supported by WP roles API directly.
		// If you need to rename, you'd create a new role and migrate users.

		return true;
	}

	/**
	 * Delete a role and unregister from plugin registry.
	 */
	public function delete_role( $slug ) {
		$slug = sanitize_key( $slug );
		if ( in_array( $slug, Provenance_Service::CORE_ROLES, true ) ) {
			return new \WP_Error( 'wpam_role_core', __( 'Cannot delete a core role.', 'wpam' ), array( 'status' => 400 ) );
		}
		remove_role( $slug );
		$this->prov->unregister_role( $slug );
		return true;
	}

	/**
	 * Duplicate role.
	 */
	public function duplicate_role( $slug ) {
		$slug = sanitize_key( $slug );
		$role = get_role( $slug );
		if ( ! $role ) {
			return new \WP_Error( 'wpam_role_not_found', __( 'Role not found.', 'wpam' ), array( 'status' => 404 ) );
		}

		$dup_slug = $slug . '_copy';
		$i = 2;
		while ( get_role( $dup_slug ) ) {
			$dup_slug = $slug . '_copy_' . $i++;
		}
		$created = add_role( $dup_slug, ucfirst( str_replace( '_', ' ', $dup_slug ) ), $role->capabilities );
		if ( null === $created ) {
			return new \WP_Error( 'wpam_role_exists', __( 'Duplicate role exists.', 'wpam' ), array( 'status' => 409 ) );
		}
		$this->prov->register_role( $dup_slug );
		return $dup_slug;
	}
}
