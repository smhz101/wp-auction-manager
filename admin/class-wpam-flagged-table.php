<?php
namespace WPAM\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Flagged_Table extends \WP_List_Table {
	public function prepare_items() {
		global $wpdb;
		$table = $wpdb->prefix . 'wpam_flagged_users';

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
					echo '<div class="notice notice-error"><p>' . esc_html__( 'Flagged users table is missing. Please reinstall the plugin to create the required database tables.', 'wpam' ) . '</p></div>';
				}
			);
			return;
		}

		$results     = $wpdb->get_results( "SELECT * FROM $table ORDER BY flagged_at DESC", ARRAY_A );
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
			'user'       => __( 'User', 'wpam' ),
			'reason'     => __( 'Reason', 'wpam' ),
			'flagged_at' => __( 'Date', 'wpam' ),
		);
	}

	protected function column_user( $item ) {
		$user = get_user_by( 'id', $item['user_id'] );
		return $user ? esc_html( $user->display_name ) : sprintf( '#%d', $item['user_id'] );
	}

	protected function column_default( $item, $column_name ) {
		return isset( $item[ $column_name ] ) ? esc_html( $item[ $column_name ] ) : '';
	}

	public function no_items() {
		printf(
			__( 'No flagged users. <a href="%s">Create a new auction</a> to start collecting user activity.', 'wpam' ),
			esc_url( admin_url( 'post-new.php?post_type=product' ) )
		);
	}
}
