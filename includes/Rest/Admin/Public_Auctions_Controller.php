<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_Query;
use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;

final class Public_Auctions_Controller extends Base_Controller {

	public function register_routes() {
		$this->route( '/public-auctions', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'index' ),
			'permission_callback' => '__return_true',
			'args'                => array(
				'q'         => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'status'    => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'minPrice'  => array( 'validate_callback' => 'is_numeric' ),
				'maxPrice'  => array( 'validate_callback' => 'is_numeric' ),
				'page'      => array( 'validate_callback' => 'is_numeric' ),
				'per_page'  => array( 'validate_callback' => 'is_numeric' ),
			),
		) );
	}

	public function index( WP_REST_Request $request ) {
		$q        = sanitize_text_field( (string) $request->get_param( 'q' ) );
		$status   = sanitize_text_field( (string) $request->get_param( 'status' ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 60, max( 1, (int) $request->get_param( 'per_page' ) ) );

		$args = array(
			'post_type'      => 'product',
			'posts_per_page' => $per_page,
			'paged'          => $page,
			's'              => $q,
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'auction',
				),
			),
			'meta_query'     => array(),
		);

		$now = current_time( 'mysql', true );

		if ( 'live' === $status ) {
			$args['meta_query'][] = array( 'key' => '_auction_start', 'value' => $now, 'compare' => '<=', 'type' => 'DATETIME' );
			$args['meta_query'][] = array( 'key' => '_auction_end',   'value' => $now, 'compare' => '>=', 'type' => 'DATETIME' );
		} elseif ( 'upcoming' === $status ) {
			$args['meta_query'][] = array( 'key' => '_auction_start', 'value' => $now, 'compare' => '>',  'type' => 'DATETIME' );
		} elseif ( 'ended' === $status ) {
			$args['meta_query'][] = array( 'key' => '_auction_end',   'value' => $now, 'compare' => '<',  'type' => 'DATETIME' );
		}

		$query = new WP_Query( $args );

		$rows = array();
		foreach ( $query->posts as $post ) {
			$id     = (int) $post->ID;
			$thumb  = get_the_post_thumbnail_url( $id, 'medium' );
			$start  = get_post_meta( $id, '_auction_start', true );
			$end    = get_post_meta( $id, '_auction_end', true );
			$state  = get_post_meta( $id, '_auction_state', true );
			$price  = (float) get_post_meta( $id, '_auction_current_bid', true );

			$rows[] = array(
				'id'       => $id,
				'title'    => $post->post_title,
				'thumb'    => $thumb ?: '',
				'startsAt' => $start,
				'endsAt'   => $end,
				'status'   => $state ?: $this->derive_status( $start, $end ),
				'current'  => $price,
				'seller'   => (int) $post->post_author,
			);
		}

		return array(
			'total' => (int) $query->found_posts,
			'rows'  => $rows,
		);
	}

	private function derive_status( $start, $end ) {
		$now = strtotime( current_time( 'mysql', true ) );
		$s   = strtotime( (string) $start );
		$e   = strtotime( (string) $end );
		if ( $s && $now < $s ) return 'upcoming';
		if ( $e && $now > $e ) return 'ended';
		return 'live';
	}
}
