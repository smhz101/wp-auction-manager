<?php
if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Bids_Table extends WP_List_Table {
    protected $auction_id;

    public function __construct( $auction_id ) {
        $this->auction_id = absint( $auction_id );
        parent::__construct();
    }

    public function prepare_items() {
        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $results = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table WHERE auction_id = %d ORDER BY bid_time DESC", $this->auction_id ), ARRAY_A );
        $this->items = $results;
        $this->set_pagination_args( [
            'total_items' => count( $results ),
            'per_page'    => 50,
            'total_pages' => 1,
        ] );
    }

    public function get_columns() {
        return [
            'user'     => __( 'User', 'wpam' ),
            'amount'   => __( 'Amount', 'wpam' ),
            'bid_time' => __( 'Bid Time', 'wpam' ),
        ];
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
        _e( 'No bids found.', 'wpam' );
    }
}
