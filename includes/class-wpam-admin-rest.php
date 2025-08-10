<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Admin_Rest {
	public static function get_auctions( \WP_REST_Request $request ) {
		$search      = sanitize_text_field( $request->get_param( 'search' ) );
		$status      = sanitize_text_field( $request->get_param( 'status' ) );
		$type        = sanitize_text_field( $request->get_param( 'type' ) );
		$page        = max( 1, intval( $request->get_param( 'page' ) ) );
		$per_page    = max( 1, intval( $request->get_param( 'per_page' ) ) );
		$args        = array(
			'post_type'      => 'product',
			'posts_per_page' => $per_page ?: 20,
			'paged'          => $page,
			's'              => $search,
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'auction',
				),
			),
			'meta_query'     => array(),
		);
				$now = wp_date( 'Y-m-d H:i:s', current_datetime()->getTimestamp(), new \DateTimeZone( 'UTC' ) );
		if ( $type ) {
			$args['meta_query'][] = array(
				'key'   => '_auction_type',
				'value' => $type,
			);
		}
		if ( 'upcoming' === $status ) {
			$args['meta_query'][] = array(
				'key'     => '_auction_start',
				'value'   => $now,
				'compare' => '>',
				'type'    => 'DATETIME',
			);
		} elseif ( 'ended' === $status ) {
			$args['meta_query'][] = array(
				'key'     => '_auction_end',
				'value'   => $now,
				'compare' => '<',
				'type'    => 'DATETIME',
			);
		} elseif ( 'active' === $status ) {
			$args['meta_query'][] = array(
				'key'     => '_auction_start',
				'value'   => $now,
				'compare' => '<=',
				'type'    => 'DATETIME',
			);
			$args['meta_query'][] = array(
				'key'     => '_auction_end',
				'value'   => $now,
				'compare' => '>=',
				'type'    => 'DATETIME',
			);
		}
		$query = new \WP_Query( $args );
		$items = array();
		foreach ( $query->posts as $post ) {
			$items[] = array(
				'id'     => $post->ID,
				'title'  => $post->post_title,
				'start'  => get_post_meta( $post->ID, '_auction_start', true ),
				'end'    => get_post_meta( $post->ID, '_auction_end', true ),
				'state'  => get_post_meta( $post->ID, '_auction_state', true ),
				'reason' => get_post_meta( $post->ID, '_auction_ending_reason', true ),
			);
		}
		return rest_ensure_response(
			array(
				'total' => $query->found_posts,
				'data'  => $items,
			)
		);
	}

	public static function get_bids( \WP_REST_Request $request ) {
		global $wpdb;
		$auction_id = absint( $request->get_param( 'auction_id' ) );
		if ( ! $auction_id ) {
			return rest_ensure_response(
				array(
					'total' => 0,
					'data'  => array(),
				)
			);
		}

		$per_page = max( 1, intval( $request->get_param( 'per_page' ) ) );
		$page     = max( 1, intval( $request->get_param( 'page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$table    = $wpdb->prefix . 'wc_auction_bids';
		$rows     = $wpdb->get_results( $wpdb->prepare( "SELECT SQL_CALC_FOUND_ROWS * FROM $table WHERE auction_id = %d ORDER BY bid_time DESC LIMIT %d OFFSET %d", $auction_id, $per_page, $offset ), ARRAY_A );
		$total    = $wpdb->get_var( 'SELECT FOUND_ROWS()' );
		$data     = array();

		foreach ( $rows as $row ) {
			$user   = get_user_by( 'id', $row['user_id'] );
			$data[] = array(
				'user'     => $user ? $user->display_name : sprintf( '#%d', $row['user_id'] ),
				'amount'   => $row['bid_amount'],
				'bid_time' => $row['bid_time'],
			);
		}

		return rest_ensure_response(
			array(
				'total' => intval( $total ),
				'data'  => $data,
			)
		);
	}

	public static function get_messages( \WP_REST_Request $request ) {
		global $wpdb;
		$table    = $wpdb->prefix . 'wc_auction_messages';
		$per_page = max( 1, intval( $request->get_param( 'per_page' ) ) );
		$page     = max( 1, intval( $request->get_param( 'page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$search   = sanitize_text_field( $request->get_param( 'search' ) );

		$where = '';
		$args  = array();
		if ( $search ) {
			$where  = ' WHERE message LIKE %s';
			$args[] = '%' . $wpdb->esc_like( $search ) . '%';
		}

		$sql    = "SELECT SQL_CALC_FOUND_ROWS * FROM $table" . $where . ' ORDER BY created_at DESC LIMIT %d OFFSET %d';
		$args[] = $per_page;
		$args[] = $offset;
		$rows   = $wpdb->get_results( $wpdb->prepare( $sql, ...$args ), ARRAY_A );
		$total  = $wpdb->get_var( 'SELECT FOUND_ROWS()' );

		$data = array();
		foreach ( $rows as $row ) {
			$user   = get_user_by( 'id', $row['user_id'] );
			$data[] = array(
				'auction' => get_the_title( $row['auction_id'] ) ?: sprintf( '#%d', $row['auction_id'] ),
				'user'    => $user ? $user->display_name : sprintf( '#%d', $row['user_id'] ),
				'message' => $row['message'],
				'status'  => $row['approved'] ? __( 'Approved', 'wpam' ) : __( 'Pending', 'wpam' ),
				'date'    => $row['created_at'],
			);
		}

		return rest_ensure_response(
			array(
				'total' => intval( $total ),
				'data'  => $data,
			)
		);
	}

	public static function get_logs( \WP_REST_Request $request ) {
		global $wpdb;
		$table    = $wpdb->prefix . 'wc_auction_logs';
		$per_page = max( 1, intval( $request->get_param( 'per_page' ) ) );
		$page     = max( 1, intval( $request->get_param( 'page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$rows     = $wpdb->get_results( $wpdb->prepare( "SELECT SQL_CALC_FOUND_ROWS * FROM $table ORDER BY logged_at DESC LIMIT %d OFFSET %d", $per_page, $offset ), ARRAY_A );
		$total    = $wpdb->get_var( 'SELECT FOUND_ROWS()' );

		$data = array();
		foreach ( $rows as $row ) {
			$admin   = get_user_by( 'id', $row['admin_id'] );
			$details = maybe_unserialize( $row['details'] );
			if ( is_array( $details ) ) {
				$details = wp_json_encode( $details );
			}
			$data[] = array(
				'auction' => get_the_title( $row['auction_id'] ) ?: sprintf( '#%d', $row['auction_id'] ),
				'admin'   => $admin ? $admin->display_name : sprintf( '#%d', $row['admin_id'] ),
				'action'  => $row['action'],
				'details' => $details,
				'date'    => $row['logged_at'],
			);
		}

		return rest_ensure_response(
			array(
				'total' => intval( $total ),
				'data'  => $data,
			)
		);
	}

	public static function get_flagged( \WP_REST_Request $request ) {
		global $wpdb;
		$table    = $wpdb->prefix . 'wpam_flagged_users';
		$per_page = max( 1, intval( $request->get_param( 'per_page' ) ) );
		$page     = max( 1, intval( $request->get_param( 'page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$rows     = $wpdb->get_results( $wpdb->prepare( "SELECT SQL_CALC_FOUND_ROWS * FROM $table ORDER BY flagged_at DESC LIMIT %d OFFSET %d", $per_page, $offset ), ARRAY_A );
		$total    = $wpdb->get_var( 'SELECT FOUND_ROWS()' );

		$data = array();
		foreach ( $rows as $row ) {
			$user   = get_user_by( 'id', $row['user_id'] );
			$data[] = array(
				'user'       => $user ? $user->display_name : sprintf( '#%d', $row['user_id'] ),
				'reason'     => $row['reason'],
				'flagged_at' => $row['flagged_at'],
			);
		}

		return rest_ensure_response(
			array(
				'total' => intval( $total ),
				'data'  => $data,
			)
		);
	}
}
