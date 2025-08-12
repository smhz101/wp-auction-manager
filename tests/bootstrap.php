<?php
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = dirname( __DIR__ ) . '/vendor/wp-phpunit/wp-phpunit';
}
if ( ! defined( 'WP_TESTS_CONFIG_FILE_PATH' ) ) {
	define( 'WP_TESTS_CONFIG_FILE_PATH', __DIR__ . '/wp-tests-config.php' );
}
require_once $_tests_dir . '/includes/functions.php';
if ( ! class_exists( 'WooCommerce' ) ) {
	class WooCommerce {}
}
function _manually_load_plugin() {
	require dirname( __DIR__ ) . '/wp-auction-manager.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );
require $_tests_dir . '/includes/bootstrap.php';
