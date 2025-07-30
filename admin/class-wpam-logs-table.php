<?php
namespace WPAM\Admin;

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Logs_Table extends \WP_List_Table {
	public function prepare_items() {
		global $wpdb;
		$table       = $wpdb->prefix . 'wc_auction_logs';
		$results     = $wpdb->get_results( "SELECT * FROM $table ORDER BY logged_at DESC", ARRAY_A );
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
			'auction' => __( 'Auction', 'wpam' ),
			'admin'   => __( 'Admin', 'wpam' ),
			'action'  => __( 'Action', 'wpam' ),
			'details' => __( 'Details', 'wpam' ),
			'date'    => __( 'Date', 'wpam' ),
		);
	}

	protected function column_auction( $item ) {
		$title = get_the_title( $item['auction_id'] );
		return $title ? esc_html( $title ) : sprintf( '#%d', $item['auction_id'] );
	}

	protected function column_admin( $item ) {
		$user = get_user_by( 'id', $item['admin_id'] );
		return $user ? esc_html( $user->display_name ) : sprintf( '#%d', $item['admin_id'] );
	}

	protected function column_details( $item ) {
		$details = maybe_unserialize( $item['details'] );
		if ( is_array( $details ) ) {
			$details = wp_json_encode( $details );
		}
		return esc_html( (string) $details );
	}

	protected function column_default( $item, $column_name ) {
		return isset( $item[ $column_name ] ) ? esc_html( $item[ $column_name ] ) : '';
	}

	public function no_items() {
		_e( 'No logs found.', 'wpam' );
	}
}
