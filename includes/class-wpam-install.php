<?php
namespace WPAM\Includes;

class WPAM_Install {
	public static function activate() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$table_name      = $wpdb->prefix . 'wc_auction_bids';
		$sql             = "CREATE TABLE IF NOT EXISTS $table_name (
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
		$watchlist_sql   = "CREATE TABLE IF NOT EXISTS $watchlist_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            auction_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            PRIMARY KEY  (id),
            KEY auction_id (auction_id),
            KEY user_id (user_id)
        ) $charset_collate;";
		dbDelta( $watchlist_sql );

		// Messages table
		$messages_table = $wpdb->prefix . 'wc_auction_messages';
		$messages_sql   = "CREATE TABLE IF NOT EXISTS $messages_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            auction_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            message text NOT NULL,
            parent_id bigint(20) unsigned NOT NULL DEFAULT 0,
            approved tinyint(1) NOT NULL DEFAULT 0,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY auction_id (auction_id),
            KEY user_id (user_id)
        ) $charset_collate;";
		dbDelta( $messages_sql );

		// Audit table
		$audit_table = $wpdb->prefix . 'wc_auction_audit';
		$audit_sql   = "CREATE TABLE IF NOT EXISTS $audit_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            bid_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            ip varchar(100) NOT NULL,
            user_agent varchar(255) NOT NULL,
            logged_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY bid_id (bid_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta( $audit_sql );

                // Flagged users table
                $flag_table = $wpdb->prefix . 'wpam_flagged_users';
                $flag_sql   = "CREATE TABLE IF NOT EXISTS $flag_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            reason varchar(255) NOT NULL,
            flagged_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $charset_collate;";
                dbDelta( $flag_sql );

		// Admin logs table
		$logs_table = $wpdb->prefix . 'wc_auction_logs';
		$logs_sql   = "CREATE TABLE IF NOT EXISTS $logs_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            auction_id bigint(20) unsigned NOT NULL,
            admin_id bigint(20) unsigned NOT NULL,
            action varchar(50) NOT NULL,
            details text NULL,
            logged_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY auction_id (auction_id),
            KEY admin_id (admin_id)
        ) $charset_collate;";
                dbDelta( $logs_sql );

                // Register custom roles.
                add_role(
                        'auction_seller',
                        __( 'Auction Seller', 'wpam' ),
                        array(
                                'read'           => true,
                                'auction_seller' => true,
                        )
                );

                add_role(
                        'auction_bidder',
                        __( 'Auction Bidder', 'wpam' ),
                        array(
                                'read'           => true,
                                'auction_bidder' => true,
                        )
                );

                // Ensure administrators retain full access.
                $admin = get_role( 'administrator' );
                if ( $admin ) {
                        $admin->add_cap( 'auction_seller' );
                        $admin->add_cap( 'auction_bidder' );
                }

                add_rewrite_endpoint( 'watchlist', EP_ROOT | EP_PAGES );
		add_rewrite_endpoint( 'my-bids', EP_ROOT | EP_PAGES );
		add_rewrite_endpoint( 'auctions-won', EP_ROOT | EP_PAGES );
		flush_rewrite_rules();

		// Schedule cron events for existing auctions
		$auctions = get_posts(
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
			$start = get_post_meta( $auction_id, '_auction_start', true );
			$end   = get_post_meta( $auction_id, '_auction_end', true );

			$start_ts = $start ? strtotime( $start ) : false;
			$end_ts   = $end ? strtotime( $end ) : false;
			$now      = current_time( 'timestamp' );

			if ( $start_ts && $start_ts > $now ) {
				wp_schedule_single_event( $start_ts, 'wpam_auction_start', array( $auction_id ) );
			}

			if ( $end_ts && $end_ts > $now ) {
				wp_schedule_single_event( $end_ts, 'wpam_auction_end', array( $auction_id ) );
			}
		}
	}
}
