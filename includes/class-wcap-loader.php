<?php
class WCAP_Loader {
    public function run() {
        // Load dependencies
        require_once WCAP_PLUGIN_DIR . 'includes/class-wcap-auction.php';
        require_once WCAP_PLUGIN_DIR . 'includes/class-wcap-bid.php';
        require_once WCAP_PLUGIN_DIR . 'admin/class-wcap-admin.php';
        require_once WCAP_PLUGIN_DIR . 'public/class-wcap-public.php';

        // Init classes
        new WCAP_Auction();
        new WCAP_Bid();
        new WCAP_Admin();
        new WCAP_Public();
    }
}
