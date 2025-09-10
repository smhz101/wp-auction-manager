<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Validation_Exception;

final class Capabilities_Controller extends Base_Controller {

	const OPT_CAPABILITIES = 'wpam_capabilities';

	public function register_routes() {
		$this->route(
			'/capabilities',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list' ),
				'permission_callback' => array( $this, 'can_read' ),
			)
		);

		$this->route(
			'/capabilities',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'upsert' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);

		$this->route(
			'/capabilities/(?P<key>[\w\.\-]+)',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);
	}

	public function can_read() {
		$this->require_logged_in();
		return current_user_can( 'manage_options' ) || current_user_can( 'list_users' );
	}

	public function can_write( $req ) {
		$this->require_logged_in();
		$this->require_rest_nonce( $req );
		return current_user_can( 'manage_options' );
	}

	public function list() {
		$capabilities = get_option( self::OPT_CAPABILITIES, array() );
		return is_array( $capabilities ) ? array_values( $capabilities ) : array();
	}

	public function upsert( WP_REST_Request $req ) {
		$body  = (array) $req->get_json_params();
		$key   = isset( $body['key'] ) ? sanitize_key( (string) $body['key'] ) : '';
		$label = isset( $body['label'] ) ? sanitize_text_field( (string) $body['label'] ) : '';

		if ( '' === $key || '' === $label ) {
			throw new Validation_Exception( __( 'Capability key and label are required.', 'wp-auction-manager' ) );
		}

		$list        = get_option( self::OPT_CAPABILITIES, array() );
		$list        = is_array( $list ) ? $list : array();
		$list[ $key] = array( 'key' => $key, 'label' => $label );

		update_option( self::OPT_CAPABILITIES, $list, false );

		return $list[ $key ];
	}

	public function delete( WP_REST_Request $req ) {
		$key  = sanitize_key( (string) $req['key'] );
		$list = get_option( self::OPT_CAPABILITIES, array() );
		if ( is_array( $list ) && isset( $list[ $key ] ) ) {
			unset( $list[ $key ] );
			update_option( self::OPT_CAPABILITIES, $list, false );
		}

		// Also remove the capability from any stored role definitions.
		$roles = get_option( Roles_Controller::OPT_ROLES, array() );
		if ( is_array( $roles ) ) {
			foreach ( $roles as $slug => $role ) {
				if ( ! empty( $role['capabilities'] ) && is_array( $role['capabilities'] ) ) {
					$roles[ $slug ]['capabilities'] = array_values(
						array_filter( $role['capabilities'], function( $c ) use ( $key ) {
							return $c !== $key;
						} )
					);
				}
			}
			update_option( Roles_Controller::OPT_ROLES, $roles, false );
		}

		return array( 'deleted' => true );
	}
}
