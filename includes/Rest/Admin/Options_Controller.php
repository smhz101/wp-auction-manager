<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Validation_Exception;

final class Options_Controller extends Base_Controller {

	/** Single option bucket to keep I/O simple & fast. */
	const OPTION_KEY = 'wpam_options';

	public function register_routes() {
		$this->route(
			'/options',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_options' ),
				'permission_callback' => array( $this, 'can_read' ),
			)
		);

		$this->route(
			'/options',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_options' ),
				'permission_callback' => array( $this, 'can_write' ),
			)
		);
	}

	public function can_read( WP_REST_Request $req ) {
		$this->require_logged_in();
		return current_user_can( 'manage_options' );
	}

	public function can_write( WP_REST_Request $req ) {
		$this->require_logged_in();
		$this->require_rest_nonce( $req );
		return current_user_can( 'manage_options' );
	}

	public function get_options() {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return $this->with_defaults( $stored );
	}

	public function update_options( WP_REST_Request $request ) {
		$payload = $request->get_json_params();
		if ( ! is_array( $payload ) ) {
			throw new Validation_Exception( __( 'Invalid JSON payload.', 'wp-auction-manager' ) );
		}

		$clean = $this->sanitize_values( $payload );
		update_option( self::OPTION_KEY, $clean, false );

		return $this->with_defaults( $clean );
	}

	private function with_defaults( array $values ) {
		// Define only keys you expose to UI. Any missing → default.
		$defaults = array(
			'wpam_enabled'             => true,
			'wpam_maintenance_mode'    => false,
			'wpam_log_level'           => 'info', // 'error'|'warn'|'info'|'debug'
			'wpam_license_status'      => 'unknown',
			'wpam_pusher_status'       => 'disabled',
			'wpam_license_key'         => '',
			'wpam_license_activation_email' => '',
			'wpam_update_channel'      => 'stable',
			'wpam_telemetry_opt_in'    => false,
			// ... you can add all keys from your IA here.
		);
		return array_merge( $defaults, $values );
	}

	private function sanitize_values( array $in ) {
		$out = array();

		$bools = array(
			'wpam_enabled',
			'wpam_maintenance_mode',
			'wpam_telemetry_opt_in',
		);
		foreach ( $bools as $k ) {
			if ( array_key_exists( $k, $in ) ) {
				$out[ $k ] = (bool) $in[ $k ];
			}
		}

		if ( isset( $in['wpam_log_level'] ) ) {
			$level = sanitize_text_field( $in['wpam_log_level'] );
			$allow = array( 'error', 'warn', 'info', 'debug' );
			$out['wpam_log_level'] = in_array( $level, $allow, true ) ? $level : 'info';
		}

		if ( isset( $in['wpam_license_key'] ) ) {
			$out['wpam_license_key'] = sanitize_text_field( $in['wpam_license_key'] );
		}

		if ( isset( $in['wpam_license_activation_email'] ) ) {
			$email = sanitize_email( $in['wpam_license_activation_email'] );
			if ( $email === '' || ! is_email( $email ) ) {
				throw new Validation_Exception(
					__( 'Invalid email for license activation.', 'wp-auction-manager' ),
					array( 'wpam_license_activation_email' => __( 'Invalid email', 'wp-auction-manager' ) )
				);
			}
			$out['wpam_license_activation_email'] = $email;
		}

		if ( isset( $in['wpam_update_channel'] ) ) {
			$ch = sanitize_text_field( $in['wpam_update_channel'] );
			$out['wpam_update_channel'] = in_array( $ch, array( 'stable', 'beta', 'alpha' ), true ) ? $ch : 'stable';
		}

		// Pass-through unknown scalars safely (optional).
		foreach ( $in as $k => $v ) {
			if ( isset( $out[ $k ] ) ) {
				continue;
			}
			if ( is_scalar( $v ) ) {
				$out[ $k ] = sanitize_text_field( (string) $v );
			}
		}

		return $out;
	}
}