<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit();
}

// Verify the current user has permission to uninstall plugins.
if ( ! current_user_can( 'activate_plugins' ) ) {
    return;
}

global $wpdb;

// Drop custom tables created by the plugin.
$tables = [
    $wpdb->prefix . 'wc_auction_bids',
    $wpdb->prefix . 'wc_auction_watchlists',
    $wpdb->prefix . 'wc_auction_messages',
];

foreach ( $tables as $table ) {
    $wpdb->query( "DROP TABLE IF EXISTS $table" );
}
