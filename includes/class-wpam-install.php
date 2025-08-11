<?php
/**
 * WP Auction Manager — Installer
 *
 * @package WPAM
 */

namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Install {

	/**
	 * Plugin activation hook.
	 *
	 * - Creates/updates DB tables via dbDelta() (no IF NOT EXISTS).
	 * - Immediately registers roles/caps and rewrite endpoints.
	 * - Flushes rewrite rules once.
	 * - Schedules auction start/end events once.
	 *
	 * @return void
	 */
	public static function activate() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Bids table.
		$table_name = $wpdb->prefix . 'wc_auction_bids';
		$sql        = "CREATE TABLE $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			auction_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			bid_amount decimal(20,2) NOT NULL,
			bid_time datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY auction_id (auction_id),
			KEY user_id (user_id),
			KEY bid_time (bid_time)
		) $charset_collate;";
		\dbDelta( $sql );

		// Watchlist table.
		$watchlist_table = $wpdb->prefix . 'wc_auction_watchlists';
		$watchlist_sql   = "CREATE TABLE $watchlist_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			auction_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			PRIMARY KEY  (id),
			KEY auction_id (auction_id),
			KEY user_id (user_id)
		) $charset_collate;";
		\dbDelta( $watchlist_sql );

		// Messages table.
		$messages_table = $wpdb->prefix . 'wc_auction_messages';
		$messages_sql   = "CREATE TABLE $messages_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			auction_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			message text NOT NULL,
			parent_id bigint(20) unsigned NOT NULL DEFAULT 0,
			approved tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY auction_id (auction_id),
			KEY user_id (user_id),
			KEY created_at (created_at)
		) $charset_collate;";
		\dbDelta( $messages_sql );

		// Audit table.
		$audit_table = $wpdb->prefix . 'wc_auction_audit';
		$audit_sql   = "CREATE TABLE $audit_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			bid_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			ip varchar(100) NOT NULL,
			user_agent varchar(255) NOT NULL,
			logged_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY bid_id (bid_id),
			KEY user_id (user_id),
			KEY logged_at (logged_at)
		) $charset_collate;";
		\dbDelta( $audit_sql );

		// Flagged users table.
		$flag_table = $wpdb->prefix . 'wc_flagged_users';
		$flag_sql   = "CREATE TABLE $flag_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			reason varchar(255) NOT NULL,
			flagged_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY flagged_at (flagged_at)
		) $charset_collate;";
		\dbDelta( $flag_sql );

		// KYC failure logs table.
		$kyc_table = $wpdb->prefix . 'wc_kyc_failures';
		$kyc_sql   = "CREATE TABLE $kyc_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			reason varchar(100) NOT NULL,
			ip varchar(100) NOT NULL,
			user_agent varchar(255) NOT NULL,
			logged_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY logged_at (logged_at)
		) $charset_collate;";
		\dbDelta( $kyc_sql );

		// Admin logs table.
		$logs_table = $wpdb->prefix . 'wc_auction_logs';
		$logs_sql   = "CREATE TABLE $logs_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			auction_id bigint(20) unsigned NOT NULL,
			admin_id bigint(20) unsigned NOT NULL,
			action varchar(50) NOT NULL,
			details text NULL,
			logged_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY auction_id (auction_id),
			KEY admin_id (admin_id),
			KEY logged_at (logged_at)
		) $charset_collate;";
		\dbDelta( $logs_sql );

		// Notification logs table.
		$notify_table = $wpdb->prefix . 'wc_notification_logs';
		$notify_sql   = "CREATE TABLE $notify_table (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			provider varchar(50) NOT NULL,
			status varchar(20) NOT NULL,
			error text NULL,
			attempt smallint unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY provider (provider),
			KEY created_at (created_at)
		) $charset_collate;";
		\dbDelta( $notify_sql );

		// Register runtime hooks (init) for endpoints and idempotent caps refresh.
		self::init_hooks();

		// Do these immediately on activation:
		\WPAM\Includes\WPAM_Capabilities::register_caps();
		self::register_endpoints();

		// Only flush rewrite rules once on activation.
		\flush_rewrite_rules();

		// Schedule auction events once (canonical path).
		self::schedule_auction_events();
	}

	/**
	 * Register runtime hooks.
	 *
	 * @return void
	 */
	public static function init_hooks() {
		\add_action( 'init', array( self::class, 'register_endpoints' ) );
		\add_action( 'init', array( \WPAM\Includes\WPAM_Capabilities::class, 'register_caps' ) );
	}

	/**
	 * Register rewrite endpoints.
	 *
	 * @return void
	 */
	public static function register_endpoints() {
		\add_rewrite_endpoint( 'watchlist', EP_ROOT | EP_PAGES );
		\add_rewrite_endpoint( 'my-bids', EP_ROOT | EP_PAGES );
		\add_rewrite_endpoint( 'auctions-won', EP_ROOT | EP_PAGES );
	}

	/**
	 * (Re)Schedule auction start/end events for all auctions having _auction_start meta.
	 *
	 * Note: Assumes stored times are UTC strings parseable by DateTimeImmutable.
	 *
	 * @return void
	 */
	private static function schedule_auction_events() {
		$auctions = \get_posts(
			array(
				'post_type'      => 'product',
				'posts_per_page' => -1,
				'meta_query'     => array(
					array(
						'key'     => '_auction_start',
						'compare' => 'EXISTS',
					),
				),
				'fields'         => 'ids',
			)
		);

		foreach ( $auctions as $auction_id ) {
			$start = \get_post_meta( $auction_id, '_auction_start', true );
			$end   = \get_post_meta( $auction_id, '_auction_end', true );

			$start_ts = $start ? ( new \DateTimeImmutable( $start, new \DateTimeZone( 'UTC' ) ) )->getTimestamp() : false;
			$end_ts   = $end ? ( new \DateTimeImmutable( $end, new \DateTimeZone( 'UTC' ) ) )->getTimestamp() : false;
			$now      = \current_datetime()->getTimestamp();

			// Clear previously scheduled events to ensure accurate timing after upgrades.
			\wp_clear_scheduled_hook( 'wpam_auction_start', array( $auction_id ) );
			\wp_clear_scheduled_hook( 'wpam_auction_end', array( $auction_id ) );

			if ( $start_ts && $start_ts > $now ) {
				\wp_schedule_single_event( $start_ts, 'wpam_auction_start', array( $auction_id ) );
			}

			if ( $end_ts && $end_ts > $now ) {
				\wp_schedule_single_event( $end_ts, 'wpam_auction_end', array( $auction_id ) );
			}
		}
	}
}