<?php
class WPAM_Install {
    public static function activate() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'wc_auction_bids';
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            auction_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            bid_amount decimal(20,2) NOT NULL,
            bid_time datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY auction_id (auction_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );

        // Watchlist table
        $watchlist_table = $wpdb->prefix . 'wc_auction_watchlists';
        $watchlist_sql = "CREATE TABLE IF NOT EXISTS $watchlist_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            auction_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            PRIMARY KEY  (id),
            KEY auction_id (auction_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta( $watchlist_sql );

        add_rewrite_endpoint( 'watchlist', EP_ROOT | EP_PAGES );
        add_rewrite_endpoint( 'my-bids', EP_ROOT | EP_PAGES );
        add_rewrite_endpoint( 'auctions-won', EP_ROOT | EP_PAGES );
        flush_rewrite_rules();
    }
}

