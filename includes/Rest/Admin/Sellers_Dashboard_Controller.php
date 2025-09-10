<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Not_Found_Exception;

final class Sellers_Dashboard_Controller extends Base_Controller {

	public function register_routes() {
		$this->route(
			'/seller/dashboard',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'dashboard' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);

		$this->route(
			'/seller/auctions/(?P<id>\d+)/pause',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'pause' ),
				'permission_callback' => array( $this, 'can_manage_mutate' ),
				'args'                => array(
					'id' => array( 'validate_callback' => 'is_numeric' ),
				),
			)
		);
	}

	public function can_manage() {
		$this->require_logged_in();
		return current_user_can( 'edit_products' ) || current_user_can( 'manage_woocommerce' );
	}

	public function can_manage_mutate( $req ) {
		$this->require_logged_in();
		$this->require_rest_nonce( $req );
		return current_user_can( 'edit_products' ) || current_user_can( 'manage_woocommerce' );
	}

	public function dashboard() {
		// Example summary (adapt to your data model).
		$q = new \WP_Query( array(
			'post_type'      => 'product',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'auction',
				),
			),
		) );

		return array(
			'stats'    => array(
				'liveCount'      => (int) $this->count_auctions_by_state( 'live' ),
				'scheduledCount' => (int) $this->count_auctions_by_state( 'scheduled' ),
				'endedCount'     => (int) $this->count_auctions_by_state( 'ended' ),
			),
			// You can add orders, payouts, recent activity, etc.
			'auctions' => $this->list_auctions_brief(),
		);
	}

	public function pause( WP_REST_Request $req ) {
		$id  = (int) $req['id'];
		$post = get_post( $id );
		if ( ! $post || 'product' !== $post->post_type ) {
			throw new Not_Found_Exception( __( 'Auction not found.', 'wp-auction-manager' ) );
		}

		// Use a safe meta flag you control (don’t overload Woo’s core status).
		update_post_meta( $id, '_wpam_paused', 1 );

		return array( 'ok' => true );
	}

	private function count_auctions_by_state( $state ) {
		$meta_query = array();
		$now        = gmdate( 'Y-m-d H:i:s' );

		if ( 'scheduled' === $state ) {
			$meta_query[] = array(
				'key'     => '_auction_start',
				'value'   => $now,
				'compare' => '>',
				'type'    => 'DATETIME',
			);
		} elseif ( 'ended' === $state ) {
			$meta_query[] = array(
				'key'     => '_auction_end',
				'value'   => $now,
				'compare' => '<',
				'type'    => 'DATETIME',
			);
		} elseif ( 'live' === $state ) {
			$meta_query[] = array(
				'key'     => '_auction_start',
				'value'   => $now,
				'compare' => '<=',
				'type'    => 'DATETIME',
			);
			$meta_query[] = array(
				'key'     => '_auction_end',
				'value'   => $now,
				'compare' => '>=',
				'type'    => 'DATETIME',
			);
		}

		$q = new \WP_Query( array(
			'post_type'      => 'product',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'auction',
				),
			),
			'meta_query'     => $meta_query,
		) );

		return (int) $q->found_posts;
	}

	private function list_auctions_brief() {
		$q = new \WP_Query( array(
			'post_type'      => 'product',
			'posts_per_page' => 12,
			'fields'         => 'ids',
			'orderby'        => 'date',
			'order'          => 'DESC',
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'auction',
				),
			),
		) );

		$out = array();
		foreach ( $q->posts as $id ) {
			$out[] = array(
				'id'         => (int) $id,
				'title'      => get_the_title( $id ),
				'thumbnail'  => get_the_post_thumbnail_url( $id, 'thumbnail' ),
				'start'      => (string) get_post_meta( $id, '_auction_start', true ),
				'end'        => (string) get_post_meta( $id, '_auction_end', true ),
				'isPaused'   => (bool) get_post_meta( $id, '_wpam_paused', true ),
				'permalink'  => get_permalink( $id ),
			);
		}
		return $out;
	}
}