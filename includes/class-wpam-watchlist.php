<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Watchlist {
    public function __construct() {
        add_action( 'wp_ajax_wpam_toggle_watchlist', [ self::class, 'toggle_watchlist' ] );
        add_action( 'wp_ajax_nopriv_wpam_toggle_watchlist', [ self::class, 'toggle_watchlist' ] );

        add_action( 'wp_ajax_wpam_get_watchlist', [ self::class, 'get_watchlist' ] );

        add_filter( 'woocommerce_account_menu_items', [ $this, 'add_account_menu_item' ] );
        add_action( 'woocommerce_account_watchlist_endpoint', [ $this, 'render_account_page' ] );
    }

    public static function toggle_watchlist() {
        check_ajax_referer( 'wpam_toggle_watchlist', 'nonce' );

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

    public static function get_user_watchlist_items( $user_id ) {
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

    public static function get_watchlist() {
        check_ajax_referer( 'wpam_get_watchlist', 'nonce' );
        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please login', 'wpam' ) ] );
        }

        wp_send_json_success( [ 'items' => self::get_user_watchlist_items( $user_id ) ] );
    }

    /**
     * REST handler to toggle watchlist items.
     */
    public static function rest_toggle_watchlist( \WP_REST_Request $request ) {
        $auction_id = absint( $request['auction_id'] );
        $user_id    = get_current_user_id();
        if ( ! $user_id ) {
            return new \WP_Error( 'wpam_login', __( 'Please login', 'wpam' ), [ 'status' => 403 ] );
        }
        if ( ! $auction_id ) {
            return new \WP_Error( 'wpam_invalid', __( 'Invalid auction', 'wpam' ), [ 'status' => 400 ] );
        }

        global $wpdb;
        $table    = $wpdb->prefix . 'wc_auction_watchlists';
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d AND auction_id = %d", $user_id, $auction_id ) );
        if ( $existing ) {
            $wpdb->delete( $table, [ 'id' => $existing ], [ '%d' ] );
            return rest_ensure_response( [ 'message' => __( 'Removed from watchlist', 'wpam' ) ] );
        }

        $wpdb->insert( $table, [ 'user_id' => $user_id, 'auction_id' => $auction_id ], [ '%d', '%d' ] );
        return rest_ensure_response( [ 'message' => __( 'Added to watchlist', 'wpam' ) ] );
    }

    /**
     * REST handler returning watchlist items for current user.
     */
    public static function rest_get_watchlist( \WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            return new \WP_Error( 'wpam_login', __( 'Please login', 'wpam' ), [ 'status' => 403 ] );
        }

        return rest_ensure_response( [ 'items' => self::get_user_watchlist_items( $user_id ) ] );
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

