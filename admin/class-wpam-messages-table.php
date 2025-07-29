<?php
namespace WPAM\Admin;

if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Messages_Table extends \WP_List_Table {
    public function prepare_items() {
        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_messages';

        if ( $wpdb->get_var( $wpdb->prepare(
            'SHOW TABLES LIKE %s', $table
        ) ) !== $table ) {
            $this->items = [];
            $this->set_pagination_args( [ 'total_items' => 0, 'per_page' => 50, 'total_pages' => 0 ] );
            add_action( 'admin_notices', function() {
                echo '<div class="error"><p>' . esc_html__( 'Auction messages table missing. Please deactivate and reactivate the plugin.', 'wpam' ) . '</p></div>';
            } );
            return;
        }

        $search  = isset( $_REQUEST['s'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['s'] ) ) : '';
        $sql     = "SELECT * FROM $table";
        if ( $search ) {
            $like = '%' . $wpdb->esc_like( $search ) . '%';
            $sql  .= $wpdb->prepare( ' WHERE message LIKE %s', $like );
        }
        $sql    .= ' ORDER BY created_at DESC';
        $results = $wpdb->get_results( $sql, ARRAY_A );
        $this->items = $results;
        $this->set_pagination_args( [
            'total_items' => count( $results ),
            'per_page'    => 50,
            'total_pages' => 1,
        ] );
    }

    public function get_columns() {
        return [
            'auction' => __( 'Auction', 'wpam' ),
            'user'    => __( 'User', 'wpam' ),
            'message' => __( 'Message', 'wpam' ),
            'status'  => __( 'Status', 'wpam' ),
            'date'    => __( 'Date', 'wpam' ),
        ];
    }

    protected function column_auction( $item ) {
        $title = get_the_title( $item['auction_id'] );
        return $title ? esc_html( $title ) : sprintf( '#%d', $item['auction_id'] );
    }

    protected function column_user( $item ) {
        $user = get_user_by( 'id', $item['user_id'] );
        return $user ? esc_html( $user->display_name ) : __( 'Unknown', 'wpam' );
    }

    protected function column_message( $item ) {
        $text    = wp_trim_words( $item['message'], 10 );
        $actions = [];
        if ( $item['approved'] ) {
            $actions['unapprove'] = sprintf( '<a href="%s">%s</a>', esc_url( wp_nonce_url( add_query_arg( [ 'action' => 'unapprove', 'message' => $item['id'] ], admin_url( 'admin.php?page=wpam-messages' ) ), 'wpam_toggle_message_' . $item['id'] ) ), __( 'Unapprove', 'wpam' ) );
        } else {
            $actions['approve'] = sprintf( '<a href="%s">%s</a>', esc_url( wp_nonce_url( add_query_arg( [ 'action' => 'approve', 'message' => $item['id'] ], admin_url( 'admin.php?page=wpam-messages' ) ), 'wpam_toggle_message_' . $item['id'] ) ), __( 'Approve', 'wpam' ) );
        }
        return esc_html( $text ) . $this->row_actions( $actions );
    }

    protected function column_status( $item ) {
        return $item['approved'] ? __( 'Approved', 'wpam' ) : __( 'Pending', 'wpam' );
    }

    protected function column_default( $item, $column_name ) {
        return isset( $item[ $column_name ] ) ? esc_html( $item[ $column_name ] ) : '';
    }
}
