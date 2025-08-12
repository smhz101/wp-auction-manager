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
	exit; // Exit if accessed directly.
}

define( 'WPAM_PLUGIN_VERSION', '1.0.3' );
define( 'WPAM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPAM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPAM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

if ( file_exists( WPAM_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once WPAM_PLUGIN_DIR . 'vendor/autoload.php';
}

/**
 * PSR-4-ish fallback autoloader for WPAM classes
 * when not covered by Composer's autoloader.
 *
 * @param string $class Fully-qualified class name.
 * @return void
 */
spl_autoload_register(
	function ( $class ) {
		if ( 0 !== strpos( $class, 'WPAM\\' ) ) {
			return;
		}

		$parts = explode( '\\', $class );
		array_shift( $parts ); // remove "WPAM" root

		$class_name = array_pop( $parts );
		$slug       = strtolower( str_replace( '_', '-', $class_name ) );

		// Try both "class-{$slug}.php" and (for names already prefixed) "class-{trimmed}.php".
		$files = array( 'class-' . $slug . '.php' );
		if ( 0 === strpos( $slug, 'wpam-' ) ) {
			$files[] = 'class-' . substr( $slug, 5 ) . '.php';
		}

		$directories = array(
			WPAM_PLUGIN_DIR . 'includes/',
			WPAM_PLUGIN_DIR . 'includes/api-integrations/',
			WPAM_PLUGIN_DIR . 'includes/auction/',
			WPAM_PLUGIN_DIR . 'admin/',
			WPAM_PLUGIN_DIR . 'public/',
		);

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
 * Load translation files.
 *
 * Hooked to init (safe and common for plugin text domains).
 *
 * @return void
 */
function wpam_load_textdomain() {
	load_plugin_textdomain( 'wpam', false, basename( __DIR__ ) . '/languages' );
}
add_action( 'init', 'wpam_load_textdomain' );

/**
 * Admin notice when WooCommerce is not active.
 *
 * @return void
 */
function wpam_wc_missing_notice() {
	echo '<div class="error"><p>' . esc_html__( 'WP Auction Manager requires WooCommerce to be installed and active.', 'wpam' ) . '</p></div>';
}

/**
 * Activation hook.
 *
 * - Verifies WooCommerce dependency.
 * - Runs installer (DB, roles/caps, endpoints, single flush, scheduling).
 * - Sets plugin version.
 * - Schedules recurring maintenance crons.
 *
 * @return void
 */
function wpam_activation() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		deactivate_plugins( WPAM_PLUGIN_BASENAME );
		add_action(
			'admin_init',
			function () {
				wp_die(
					esc_html__( 'WP Auction Manager requires WooCommerce to be installed and active.', 'wpam' ),
					esc_html__( 'Plugin dependency check', 'wpam' ),
					array( 'back_link' => true )
				);
			}
		);
		// bail early; no further activation steps without Woo.
		return;
	}

	\WPAM\Includes\WPAM_Install::activate();
	update_option( 'wpam_version', WPAM_PLUGIN_VERSION );

	// Schedule housekeeping crons (hourly).
	if ( ! wp_next_scheduled( 'wpam_check_ended_auctions' ) ) {
		wp_schedule_event( time(), 'hourly', 'wpam_check_ended_auctions' );
	}
	if ( ! wp_next_scheduled( 'wpam_update_auction_states' ) ) {
		wp_schedule_event( time(), 'hourly', 'wpam_update_auction_states' );
	}
}
register_activation_hook( __FILE__, 'wpam_activation' );

/**
 * Bootstraps the plugin runtime (hooks, services, etc.).
 *
 * @return void
 */
function wpam_run_plugin() {
	$loader = new \WPAM\Includes\WPAM_Loader();
	$loader->run();
}

/**
 * Deactivation hook.
 *
 * - Clears scheduled events (all args).
 * - Purges any wpam_* transients (site & single).
 *
 * @return void
 */
function wpam_deactivation() {
	$hooks = array(
		'wpam_check_ended_auctions',
		'wpam_update_auction_states',
		'wpam_auction_start',
		'wpam_auction_end',
	);

	foreach ( $hooks as $hook ) {
		wp_clear_scheduled_hook( $hook );
	}

	global $wpdb;
	$patterns = array(
		'_transient_wpam_%',
		'_site_transient_wpam_%',
	);
	foreach ( $patterns as $like ) {
		$results = $wpdb->get_col( $wpdb->prepare( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s", $like ) );
		foreach ( $results as $option_name ) {
			$transient = str_replace( array( '_transient_', '_site_transient_' ), '', $option_name );
			delete_transient( $transient );
			delete_site_transient( $transient );
		}
	}
}
register_deactivation_hook( __FILE__, 'wpam_deactivation' );

/**
 * Initialize the plugin only when WooCommerce is active.
 *
 * Also re-runs installer when version changes (migrations, rewrite, caps),
 * letting WPAM_Install::activate() handle idempotent updates safely.
 *
 * @return void
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

	// Initialize notifications after core services are up.
	if ( class_exists( '\WPAM\Includes\WPAM_Notifications' ) ) {
		\WPAM\Includes\WPAM_Notifications::init();
	}
}
add_action( 'plugins_loaded', 'wpam_plugins_loaded' );