<?php
class WPAM_Loader {
    public function run() {
        // Load dependencies
        if ( file_exists( WPAM_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
            require_once WPAM_PLUGIN_DIR . 'vendor/autoload.php';
        }
        require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-auction.php';
        require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-bid.php';
        require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-watchlist.php';
        require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-messages.php';
        require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-notifications.php';
        require_once WPAM_PLUGIN_DIR . 'includes/api-integrations/class-api-provider.php';
        require_once WPAM_PLUGIN_DIR . 'includes/api-integrations/class-twilio-provider.php';
        require_once WPAM_PLUGIN_DIR . 'admin/class-wpam-admin.php';
        require_once WPAM_PLUGIN_DIR . 'public/class-wpam-public.php';
        require_once WPAM_PLUGIN_DIR . 'includes/api-integrations/class-realtime-provider.php';
        require_once WPAM_PLUGIN_DIR . 'includes/api-integrations/class-pusher-provider.php';

        // Init classes
        new WPAM_Auction();
        new WPAM_Bid();
        new WPAM_Watchlist();
        new WPAM_Messages();
        new WPAM_Admin();
        new WPAM_Public();
    }
}
