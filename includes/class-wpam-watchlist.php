<?php
class WPAM_Watchlist {
    public function __construct() {
        add_action( 'wp_ajax_wpam_toggle_watchlist', [ $this, 'toggle_watchlist' ] );
        add_action( 'wp_ajax_nopriv_wpam_toggle_watchlist', [ $this, 'toggle_watchlist' ] );

        add_action( 'wp_ajax_wpam_get_watchlist', [ $this, 'get_watchlist' ] );

        add_action( 'init', [ $this, 'add_account_endpoint' ] );
        add_filter( 'woocommerce_account_menu_items', [ $this, 'add_account_menu_item' ] );
        add_action( 'woocommerce_account_watchlist_endpoint', [ $this, 'render_account_page' ] );
    }

    public function toggle_watchlist() {
        if ( empty( $_POST['auction_id'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid auction', 'wpam' ) ] );
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please login', 'wpam' ) ] );
        }

        $auction_id = absint( $_POST['auction_id'] );
        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_watchlists';
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d AND auction_id = %d", $user_id, $auction_id ) );
        if ( $existing ) {
            $wpdb->delete( $table, [ 'id' => $existing ], [ '%d' ] );
            wp_send_json_success( [ 'message' => __( 'Removed from watchlist', 'wpam' ) ] );
        } else {
            $wpdb->insert( $table, [
                'user_id'    => $user_id,
                'auction_id' => $auction_id,
            ], [ '%d', '%d' ] );
            wp_send_json_success( [ 'message' => __( 'Added to watchlist', 'wpam' ) ] );
        }
    }

    public function get_user_watchlist_items( $user_id ) {
        global $wpdb;
        $table        = $wpdb->prefix . 'wc_auction_watchlists';
        $auction_ids  = $wpdb->get_col( $wpdb->prepare( "SELECT auction_id FROM $table WHERE user_id = %d", $user_id ) );

        $items = [];
        foreach ( $auction_ids as $auction_id ) {
            $items[] = [
                'id'    => $auction_id,
                'title' => get_the_title( $auction_id ),
                'url'   => get_permalink( $auction_id ),
            ];
        }

        return $items;
    }

    public function get_watchlist() {
        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please login', 'wpam' ) ] );
        }

        wp_send_json_success( [ 'items' => $this->get_user_watchlist_items( $user_id ) ] );
    }

    public function add_account_endpoint() {
        add_rewrite_endpoint( 'watchlist', EP_ROOT | EP_PAGES );
    }

    public function add_account_menu_item( $items ) {
        $items['watchlist'] = __( 'Watchlist', 'wpam' );
        return $items;
    }

    public function render_account_page() {
        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            echo '<p>' . esc_html__( 'Please login to view your watchlist.', 'wpam' ) . '</p>';
            return;
        }

        $items = $this->get_user_watchlist_items( $user_id );
        if ( empty( $items ) ) {
            echo '<p>' . esc_html__( 'Your watchlist is empty.', 'wpam' ) . '</p>';
            return;
        }

        echo '<ul class="wpam-watchlist-items">';
        foreach ( $items as $item ) {
            echo '<li><a href="' . esc_url( $item['url'] ) . '">' . esc_html( $item['title'] ) . '</a></li>';
        }
        echo '</ul>';
    }
}

