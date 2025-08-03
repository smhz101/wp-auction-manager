<?php
/*
Plugin Name: WP Auction Manager
Description: Convert WooCommerce products into auctions with optional real-time and notification integrations.
Version: 1.0.3
Author: Muzammil Hussain
Author URI: https://muzammil.dev
Uninstall: uninstall.php
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}


define( 'WPAM_PLUGIN_VERSION', '1.0.3' );
define( 'WPAM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPAM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPAM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

if ( file_exists( WPAM_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once WPAM_PLUGIN_DIR . 'vendor/autoload.php';
}

// Autoload plugin classes when Composer's autoloader does not map them.
spl_autoload_register(
    function ( $class ) {
        if ( 0 !== strpos( $class, 'WPAM\\' ) ) {
            return;
        }

        $parts = explode( '\\', $class );
        array_shift( $parts ); // Remove "WPAM" namespace root.

        $class_name = array_pop( $parts );
        $slug       = strtolower( str_replace( '_', '-', $class_name ) );

        $files = [ 'class-' . $slug . '.php' ];
        if ( 0 === strpos( $slug, 'wpam-' ) ) {
            $files[] = 'class-' . substr( $slug, 5 ) . '.php';
        }

        $directories = [
            WPAM_PLUGIN_DIR . 'includes/',
            WPAM_PLUGIN_DIR . 'includes/api-integrations/',
            WPAM_PLUGIN_DIR . 'includes/auction/',
            WPAM_PLUGIN_DIR . 'admin/',
            WPAM_PLUGIN_DIR . 'public/',
        ];

        foreach ( $directories as $directory ) {
            foreach ( $files as $file ) {
                $path = $directory . $file;
                if ( file_exists( $path ) ) {
                    require_once $path;
                    return;
                }
            }
        }
    }
);

/**
 * Load plugin translation files.
 */
function wpam_load_textdomain() {
    load_plugin_textdomain( 'wpam', false, basename( dirname( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'wpam_load_textdomain' );
add_action( 'init', [ '\\WPAM\\Includes\\WPAM_Install', 'register_endpoints' ] );

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
    update_option( 'wpam_version', WPAM_PLUGIN_VERSION );
}

function wpam_run_plugin() {
    $loader = new \WPAM\Includes\WPAM_Loader();
    $loader->run();
}

register_activation_hook( __FILE__, 'wpam_activation' );
/**
 * Deactivation hook to clear cron events and cached data.
 */
function wpam_deactivation() {
    $hooks = [
        'wpam_check_ended_auctions',
        'wpam_update_auction_states',
        'wpam_auction_start',
        'wpam_auction_end',
    ];

    foreach ( $hooks as $hook ) {
        wp_clear_scheduled_hook( $hook );
    }

    global $wpdb;
    $patterns   = [
        "_transient_wpam_%",
        "_site_transient_wpam_%",
    ];
    foreach ( $patterns as $like ) {
        $results = $wpdb->get_col( $wpdb->prepare( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s", $like ) );
        foreach ( $results as $option_name ) {
            $transient = str_replace( [ '_transient_', '_site_transient_' ], '', $option_name );
            delete_transient( $transient );
            delete_site_transient( $transient );
        }
    }
}

register_deactivation_hook( __FILE__, 'wpam_deactivation' );

/**
 * Initialize the plugin only when WooCommerce is active.
 */
function wpam_plugins_loaded() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', 'wpam_wc_missing_notice' );
        return;
    }

    $installed = get_option( 'wpam_version' );
    if ( WPAM_PLUGIN_VERSION !== $installed ) {
        \WPAM\Includes\WPAM_Install::activate();
        update_option( 'wpam_version', WPAM_PLUGIN_VERSION );
    }

    wpam_run_plugin();
}
add_action( 'plugins_loaded', 'wpam_plugins_loaded' );
