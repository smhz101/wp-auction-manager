<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Loader {
	public function run() {
		// Load dependencies
		if ( file_exists( WPAM_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
			require_once WPAM_PLUGIN_DIR . 'vendor/autoload.php';
		}

		// Init classes
		// Register event listeners
		WPAM_Event_Bus::register( new WPAM_Notifications() );
		if ( 'pusher' === get_option( 'wpam_realtime_provider', 'none' ) ) {
				$pusher_provider = new WPAM_Pusher_Provider();
			if ( $pusher_provider->is_active() ) {
					WPAM_Event_Bus::register( $pusher_provider );
			}
		} else {
				update_option( 'wpam_pusher_status', 'disabled' );
		}

		new WPAM_Auction();
		new WPAM_Bid();
		new WPAM_Watchlist();
		new WPAM_KYC();
		new WPAM_Messages();
		new \WPAM\Admin\WPAM_Admin();
		new \WPAM\Public\WPAM_Public();
		new \WPAM\Public\WPAM_Shortcodes();
		new WPAM_Blocks();
		new WPAM_Webhooks();
	}
}
