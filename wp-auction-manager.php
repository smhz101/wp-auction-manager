<?php
/*
Plugin Name: WP Auction Manager
Description: Convert WooCommerce products into auctions with optional real-time and notification integrations.
Version: 0.1.0
Author: Codex GPT
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

define( 'WCAP_PLUGIN_VERSION', '0.1.0' );
define( 'WCAP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

define( 'WCAP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

define( 'WCAP_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once WCAP_PLUGIN_DIR . 'includes/class-wcap-loader.php';

function wcap_run_plugin() {
    $loader = new WCAP_Loader();
    $loader->run();
}

wcap_run_plugin();

?>
