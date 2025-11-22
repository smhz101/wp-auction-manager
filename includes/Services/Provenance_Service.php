<?php
namespace WPAM\Includes\Services;

if ( ! defined( 'ABSPATH' ) ) { exit; }

class Provenance_Service {

	/** Core role slugs */
	const CORE_ROLES = array( 'administrator', 'editor', 'author', 'contributor', 'subscriber' );

	/**
	 * Minimal baseline capabilities that ship with WordPress.
	 * (You can extend this list over time.)
	 */
	const CORE_CAPS = array(
		'read', 'edit_posts', 'delete_posts', 'publish_posts', 'upload_files',
		'edit_others_posts', 'delete_others_posts', 'edit_published_posts',
		'delete_published_posts', 'manage_categories', 'moderate_comments',
		'manage_options', 'unfiltered_html',
	);

	/** Option names to persist plugin-created resources */
	const OPT_ROLE_REG   = 'wpam_role_registry'; // array of role slugs
	const OPT_CAP_REG    = 'wpam_cap_registry';  // array( cap_key => array( 'label' => '', 'group' => '' ) )

	/**
	 * Get registered WPAM roles (slugs).
	 *
	 * @return array
	 */
	public function get_plugin_roles() {
		$list = get_option( self::OPT_ROLE_REG, array() );
		return is_array( $list ) ? array_values( array_unique( array_map( 'sanitize_key', $list ) ) ) : array();
	}

	/**
	 * Add a role slug to registry.
	 */
	public function register_role( $slug ) {
		$slug = sanitize_key( $slug );
		$list = $this->get_plugin_roles();
		if ( ! in_array( $slug, $list, true ) ) {
			$list[] = $slug;
			update_option( self::OPT_ROLE_REG, $list, false );
		}
	}

	/**
	 * Remove a role slug from registry.
	 */
	public function unregister_role( $slug ) {
		$slug = sanitize_key( $slug );
		$list = $this->get_plugin_roles();
		$list = array_values( array_diff( $list, array( $slug ) ) );
		update_option( self::OPT_ROLE_REG, $list, false );
	}

	/**
	 * Get plugin capability registry.
	 *
	 * @return array cap_key => array{ label, group }
	 */
	public function get_plugin_caps() {
		$map = get_option( self::OPT_CAP_REG, array() );
		return is_array( $map ) ? $map : array();
	}

	/**
	 * Upsert a capability in registry.
	 */
	public function upsert_cap( $key, $label = '', $group = '' ) {
		$key   = sanitize_key( $key );
		$label = sanitize_text_field( $label );
		$group = sanitize_key( $group );
		$map   = $this->get_plugin_caps();
		$map[ $key ] = array( 'label' => $label, 'group' => $group );
		update_option( self::OPT_CAP_REG, $map, false );
	}

	/**
	 * Remove capability from registry.
	 */
	public function remove_cap( $key ) {
		$key = sanitize_key( $key );
		$map = $this->get_plugin_caps();
		if ( isset( $map[ $key ] ) ) {
			unset( $map[ $key ] );
			update_option( self::OPT_CAP_REG, $map, false );
		}
	}

	/**
	 * Resolve role source: core | plugin:wpam | plugin:other
	 */
	public function role_source( $slug ) {
		$slug = sanitize_key( $slug );
		if ( in_array( $slug, self::CORE_ROLES, true ) ) {
			return 'core';
		}
		if ( in_array( $slug, $this->get_plugin_roles(), true ) ) {
			return 'plugin:wpam';
		}
		return 'plugin:other';
	}

	/**
	 * Resolve capability source: core | plugin:wpam | plugin:other
	 */
	public function cap_source( $key ) {
		$key = sanitize_key( $key );
		if ( in_array( $key, self::CORE_CAPS, true ) ) {
			return 'core';
		}
		$map = $this->get_plugin_caps();
		if ( isset( $map[ $key ] ) ) {
			return 'plugin:wpam';
		}
		return 'plugin:other';
	}

	/**
	 * Humanize a capability key when we do not have a label.
	 */
	public function label_from_key( $key ) {
		$key = str_replace( array( '_', '-' ), ' ', sanitize_key( $key ) );
		return ucwords( $key );
	}
}
