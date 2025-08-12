<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Fraud_Detector {
	/**
	 * Analyze a newly logged bid for suspicious patterns.
	 *
	 * @param int $bid_id  Bid ID just logged.
	 * @param int $user_id User ID who placed the bid.
	 */
	public static function analyze_bid( $bid_id, $user_id ) {
		global $wpdb;
		$audit = $wpdb->prefix . 'wc_auction_audit';
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT ip, logged_at FROM $audit WHERE bid_id = %d", $bid_id ), ARRAY_A );
		if ( ! $row ) {
			return;
		}
		$ip        = $row['ip'];
		$logged_at = $row['logged_at'];

		// Pattern 1: Same IP used by multiple users within last day.
		$count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(DISTINCT user_id) FROM $audit WHERE ip = %s AND logged_at >= DATE_SUB(%s, INTERVAL 1 DAY)", $ip, $logged_at ) );
		if ( intval( $count ) > 1 ) {
			self::flag_user( $user_id, sprintf( /* translators: %s: IP address */ __( 'Shared IP detected: %s', 'wpam' ), $ip ) );
		}

		// Pattern 2: Rapid bid frequency from same user within 10 seconds.
		$freq = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $audit WHERE user_id = %d AND logged_at >= DATE_SUB(%s, INTERVAL 10 SECOND)", $user_id, $logged_at ) );
		if ( intval( $freq ) >= 3 ) {
			self::flag_user( $user_id, __( 'High bid frequency', 'wpam' ) );
		}
	}

	/**
	 * Record a flagged user event.
	 *
	 * @param int    $user_id User ID being flagged.
	 * @param string $reason  Reason for flagging.
	 */
	private static function flag_user( $user_id, $reason ) {
		global $wpdb;
		$table  = $wpdb->prefix . 'wc_flagged_users';
		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d AND reason = %s", $user_id, $reason ) );
		if ( $exists ) {
			return;
		}
		$wpdb->insert(
			$table,
			array(
				'user_id'    => $user_id,
				'reason'     => $reason,
				'flagged_at' => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s' )
		);
	}
}
