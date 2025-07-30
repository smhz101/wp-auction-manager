<?php
namespace WPAM\Admin;

if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Flagged_Table extends \WP_List_Table {
    public function prepare_items() {
        global $wpdb;
        $table       = $wpdb->prefix . 'wpam_flagged_users';
        $results     = $wpdb->get_results( "SELECT * FROM $table ORDER BY flagged_at DESC", ARRAY_A );
        $this->items = $results;
        $this->set_pagination_args([
            'total_items' => count( $results ),
            'per_page'    => 50,
            'total_pages' => 1,
        ]);
    }

    public function get_columns() {
        return [
            'user'       => __( 'User', 'wpam' ),
            'reason'     => __( 'Reason', 'wpam' ),
            'flagged_at' => __( 'Date', 'wpam' ),
        ];
    }

    protected function column_user( $item ) {
        $user = get_user_by( 'id', $item['user_id'] );
        return $user ? esc_html( $user->display_name ) : sprintf( '#%d', $item['user_id'] );
    }

    protected function column_default( $item, $column_name ) {
        return isset( $item[ $column_name ] ) ? esc_html( $item[ $column_name ] ) : '';
    }

    public function no_items() {
        _e( 'No flagged users.', 'wpam' );
    }
}
