<?php
namespace WPAM\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Bids_Table extends \WP_List_Table {
	protected $auction_id;

	public function __construct( $auction_id ) {
		$this->auction_id = absint( $auction_id );
		parent::__construct();
	}

	public function prepare_items() {
		global $wpdb;
		$table = $wpdb->prefix . 'wc_auction_bids';

		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			$this->items = array();
			$this->set_pagination_args(
				array(
					'total_items' => 0,
					'per_page'    => 50,
					'total_pages' => 0,
				)
			);
			add_action(
				'admin_notices',
				function () {
					echo '<div class="notice notice-error"><p>' . esc_html__( 'Auction bids table is missing. Please reinstall the plugin to create the required database tables.', 'wpam' ) . '</p></div>';
				}
			);
			return;
		}

		$results     = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table WHERE auction_id = %d ORDER BY bid_time DESC", $this->auction_id ), ARRAY_A );
		$this->items = $results;
		$this->set_pagination_args(
			array(
				'total_items' => count( $results ),
				'per_page'    => 50,
				'total_pages' => 1,
			)
		);
	}

	public function get_columns() {
		return array(
			'user'     => __( 'User', 'wpam' ),
			'amount'   => __( 'Amount', 'wpam' ),
			'bid_time' => __( 'Bid Time', 'wpam' ),
		);
	}

	protected function column_user( $item ) {
		$user = get_user_by( 'id', $item['user_id'] );
		return $user ? esc_html( $user->display_name ) : __( 'Unknown', 'wpam' );
	}

	protected function column_amount( $item ) {
		if ( function_exists( 'wc_price' ) ) {
			return wc_price( $item['bid_amount'] );
		}
		return esc_html( $item['bid_amount'] );
	}

	protected function column_default( $item, $column_name ) {
		return isset( $item[ $column_name ] ) ? esc_html( $item[ $column_name ] ) : '';
	}

	public function no_items() {
		printf(
			__( 'No bids found. <a href="%s">Create a new auction</a> to collect bids.', 'wpam' ),
			esc_url( admin_url( 'post-new.php?post_type=product' ) )
		);
	}
}
