<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
		exit; // Exit if accessed directly
}

class WPAM_Logger {
	public static function log( $user_id, $provider, $status, $error = '', $attempt = 0 ) {
			global $wpdb;
			$table = $wpdb->prefix . 'wc_notification_logs';
			$wpdb->insert(
				$table,
				array(
					'user_id'    => $user_id,
					'provider'   => $provider,
					'status'     => $status,
					'error'      => $error,
					'attempt'    => $attempt,
					'created_at' => current_time( 'mysql', true ),
				),
				array( '%d', '%s', '%s', '%s', '%d', '%s' )
			);
	}
}
