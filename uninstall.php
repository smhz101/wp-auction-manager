<?php
/**
 * Uninstall routine for WP Auction Manager.
 *
 * Drops custom database tables when the plugin is deleted.
 *
 * @package WP_Auction_Manager
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit; // Exit if accessed directly
}

// Verify the current user has permission to uninstall plugins.
if ( ! current_user_can( 'activate_plugins' ) ) {
	return;
}

global $wpdb;

// Drop custom tables created by the plugin.
$tables = array(
	$wpdb->prefix . 'wc_auction_bids',
	$wpdb->prefix . 'wc_auction_watchlists',
	$wpdb->prefix . 'wc_auction_messages',
	$wpdb->prefix . 'wc_auction_audit',
	$wpdb->prefix . 'wpam_flagged_users',
	$wpdb->prefix . 'wc_auction_logs',
);

foreach ( $tables as $table ) {
// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange
	$wpdb->query( "DROP TABLE IF EXISTS {$table}" );
}
