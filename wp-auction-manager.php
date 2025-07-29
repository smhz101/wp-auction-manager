<?php
/*
Plugin Name: WP Auction Manager
Description: Convert WooCommerce products into auctions with optional real-time and notification integrations.
Version: 1.0.0
Author: Muzammil Hussain
Author URI: https://muzammil.dev
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

define( 'WPAM_PLUGIN_VERSION', '1.0.0' );
define( 'WPAM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

define( 'WPAM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

define( 'WPAM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-loader.php';
require_once WPAM_PLUGIN_DIR . 'includes/class-wpam-install.php';

function wpam_run_plugin() {
    $loader = new WPAM_Loader();
    $loader->run();
}

register_activation_hook( __FILE__, [ 'WPAM_Install', 'activate' ] );
register_deactivation_hook( __FILE__, function() {
    // Reserved for future cleanup tasks
} );

wpam_run_plugin();

?>
