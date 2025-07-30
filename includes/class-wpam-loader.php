<?php
namespace WPAM\Includes;

class WPAM_Loader {
    public function run() {
        // Load dependencies
        if ( file_exists( WPAM_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
            require_once WPAM_PLUGIN_DIR . 'vendor/autoload.php';
        }

        // Init classes
        new WPAM_Auction();
        new WPAM_Bid();
        new WPAM_Watchlist();
        new WPAM_KYC();
        new WPAM_Messages();
        new \WPAM\Admin\WPAM_Admin();
        new \WPAM\Public\WPAM_Public();
        new WPAM_Blocks();
        new WPAM_Webhooks();
    }
}
