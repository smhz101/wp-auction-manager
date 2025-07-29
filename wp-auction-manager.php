<?php
/*
Plugin Name: WP Auction Manager
Description: Convert WooCommerce products into auctions with optional real-time and notification integrations.
Version: 1.0.1
Author: Muzammil Hussain
Author URI: https://muzammil.dev
Uninstall: uninstall.php
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}


define( 'WPAM_PLUGIN_VERSION', '1.0.1' );
define( 'WPAM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPAM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPAM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

if ( file_exists( WPAM_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once WPAM_PLUGIN_DIR . 'vendor/autoload.php';
}

/**
 * Load plugin translation files.
 */
function wpam_load_textdomain() {
    load_plugin_textdomain( 'wpam', false, basename( dirname( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'wpam_load_textdomain' );

/**
 * Show admin notice when WooCommerce is missing.
 */
function wpam_wc_missing_notice() {
    echo '<div class="error"><p>' . esc_html__( 'WP Auction Manager requires WooCommerce to be installed and active.', 'wpam' ) . '</p></div>';
}

/**
 * Activation hook to ensure WooCommerce is active.
 */
function wpam_activation() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        deactivate_plugins( WPAM_PLUGIN_BASENAME );
        wp_die(
            esc_html__( 'WP Auction Manager requires WooCommerce to be installed and active.', 'wpam' ),
            esc_html__( 'Plugin dependency check', 'wpam' ),
            [ 'back_link' => true ]
        );
    }

    \WPAM\Includes\WPAM_Install::activate();
}

function wpam_run_plugin() {
    $loader = new \WPAM\Includes\WPAM_Loader();
    $loader->run();
}

register_activation_hook( __FILE__, 'wpam_activation' );
register_deactivation_hook( __FILE__, function() {
    // Reserved for future cleanup tasks
} );

/**
 * Initialize the plugin only when WooCommerce is active.
 */
function wpam_plugins_loaded() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', 'wpam_wc_missing_notice' );
        return;
    }

    wpam_run_plugin();
}
add_action( 'plugins_loaded', 'wpam_plugins_loaded' );
