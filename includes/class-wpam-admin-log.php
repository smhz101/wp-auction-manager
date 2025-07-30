<?php
namespace WPAM\Includes;

class WPAM_Admin_Log {
	const ACTION_SUSPEND    = 'suspend';
	const ACTION_CANCEL     = 'cancel';
	const ACTION_PRICE_EDIT = 'price_edit';

	public static function log_suspend( $auction_id ) {
		self::insert_log( $auction_id, self::ACTION_SUSPEND );
	}

	public static function log_cancel( $auction_id ) {
		self::insert_log( $auction_id, self::ACTION_CANCEL );
	}

	public static function log_price_edit( $auction_id, $old_price, $new_price ) {
		$details = wp_json_encode(
			array(
				'old_price' => $old_price,
				'new_price' => $new_price,
			)
		);
		self::insert_log( $auction_id, self::ACTION_PRICE_EDIT, $details );
	}

	protected static function insert_log( $auction_id, $action, $details = '' ) {
		global $wpdb;
		$table = $wpdb->prefix . 'wc_auction_logs';
		$wpdb->insert(
			$table,
			array(
				'auction_id' => absint( $auction_id ),
				'admin_id'   => get_current_user_id(),
				'action'     => $action,
				'details'    => maybe_serialize( $details ),
				'logged_at'  => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
			),
			array( '%d', '%d', '%s', '%s', '%s' )
		);
	}
}
