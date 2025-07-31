<?php
namespace WPAM\Includes;

class WPAM_Admin_Rest {
	public static function get_auctions( \WP_REST_Request $request ) {
		$search   = sanitize_text_field( $request->get_param( 'search' ) );
		$status   = sanitize_text_field( $request->get_param( 'status' ) );
		$type     = sanitize_text_field( $request->get_param( 'type' ) );
		$page     = max( 1, intval( $request->get_param( 'page' ) ) );
		$per_page = max( 1, intval( $request->get_param( 'per_page' ) ) );
		$args     = array(
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
		$now      = wp_date( 'Y-m-d H:i:s', current_datetime()->getTimestamp(), wp_timezone() );
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
				'ID'     => $post->ID,
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
}
