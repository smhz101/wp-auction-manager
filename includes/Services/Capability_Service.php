<?php
namespace WPAM\Includes\Services;

if ( ! defined( 'ABSPATH' ) ) { exit; }

class Capability_Service {

	/** @var Provenance_Service */
	protected $prov;

	public function __construct( Provenance_Service $prov ) {
		$this->prov = $prov;
	}

	/**
	 * Return capability catalog aggregated from all roles,
	 * decorated with labels/groups/source.
	 *
	 * @return array
	 */
	public function get_catalog() {
		global $wp_roles;
		if ( ! isset( $wp_roles ) ) {
			$wp_roles = wp_roles();
		}

		$seen = array();
		foreach ( $wp_roles->roles as $role ) {
			if ( empty( $role['capabilities'] ) || ! is_array( $role['capabilities'] ) ) {
				continue;
			}
			foreach ( $role['capabilities'] as $cap => $granted ) {
				if ( $granted ) { $seen[ $cap ] = true; }
			}
		}

		$map = $this->prov->get_plugin_caps();
		$out = array();

		foreach ( array_keys( $seen ) as $key ) {
			$key     = sanitize_key( $key );
			$source  = $this->prov->cap_source( $key );
			$label   = isset( $map[ $key ]['label'] ) ? $map[ $key ]['label'] : $this->prov->label_from_key( $key );
			$group   = isset( $map[ $key ]['group'] ) ? $map[ $key ]['group'] : '';
			$out[] = array(
				'key'   => $key,
				'label' => $label,
				'group' => $group,
				'source'=> $source,
			);
		}

		usort( $out, function( $a, $b ) {
			if ( $a['source'] === $b['source'] ) { return strcmp( $a['key'], $b['key'] ); }
			if ( 'core' === $a['source'] ) { return -1; }
			if ( 'core' === $b['source'] ) { return 1; }
			if ( 'plugin:wpam' === $a['source'] ) { return -1; }
			if ( 'plugin:wpam' === $b['source'] ) { return 1; }
			return strcmp( $a['key'], $b['key'] );
		} );

		return $out;
	}

	public function upsert( $key, $label = '', $group = '' ) {
		$this->prov->upsert_cap( $key, $label, $group );
		return true;
	}

	public function remove( $key ) {
		$this->prov->remove_cap( $key );
		return true;
	}
}
