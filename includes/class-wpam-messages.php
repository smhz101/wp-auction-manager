<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Messages {
    public function __construct() {
        add_action( 'wp_ajax_wpam_submit_question', [ $this, 'submit_question' ] );
        add_action( 'wp_ajax_nopriv_wpam_submit_question', [ $this, 'submit_question' ] );
        add_action( 'wp_ajax_wpam_get_messages', [ $this, 'get_messages' ] );
        add_action( 'wp_ajax_nopriv_wpam_get_messages', [ $this, 'get_messages' ] );
    }

    public function submit_question() {
        check_ajax_referer( 'wpam_submit_question', 'nonce' );

        if ( empty( $_POST['auction_id'] ) || empty( $_POST['message'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid data', 'wpam' ) ] );
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please login', 'wpam' ) ] );
        }

        global $wpdb;
        $table = $wpdb->prefix . 'wc_auction_messages';

        $wpdb->insert(
            $table,
            [
                'auction_id' => absint( $_POST['auction_id'] ),
                'user_id'    => $user_id,
                'message'    => sanitize_textarea_field( wp_unslash( $_POST['message'] ) ),
                'parent_id'  => isset( $_POST['parent_id'] ) ? absint( $_POST['parent_id'] ) : 0,
                'approved'   => 0,
                'created_at' => current_time( 'mysql', true ),
            ],
            [ '%d', '%d', '%s', '%d', '%d', '%s' ]
        );

        wp_send_json_success( [ 'message' => __( 'Message submitted for review.', 'wpam' ) ] );
    }

    public function get_messages() {
        check_ajax_referer( 'wpam_get_messages', 'nonce' );
        if ( empty( $_POST['auction_id'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid auction', 'wpam' ) ] );
        }

        global $wpdb;
        $table  = $wpdb->prefix . 'wc_auction_messages';
        $results = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table WHERE auction_id = %d AND approved = 1 ORDER BY created_at ASC", absint( $_POST['auction_id'] ) ), ARRAY_A );

        $messages = [];
        foreach ( $results as $row ) {
            $user = get_user_by( 'id', $row['user_id'] );
            $messages[] = [
                'id'        => $row['id'],
                'user'      => $user ? esc_html( $user->display_name ) : __( 'Unknown', 'wpam' ),
                'message'   => esc_html( $row['message'] ),
                'parent_id' => $row['parent_id'],
                'date'      => get_date_from_gmt( $row['created_at'], 'Y-m-d H:i:s' ),
            ];
        }

        wp_send_json_success( [ 'messages' => $messages ] );
    }
}
