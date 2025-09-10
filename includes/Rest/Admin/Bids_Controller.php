<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Forbidden_Exception;
use WPAM\Includes\Support\Exceptions\Validation_Exception;

final class Bids_Controller extends Base_Controller {

	public function register_routes() {
		$this->route( '/bids', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'index' ),
			'permission_callback' => array( $this, 'must_manage' ),
			'args'                => array(
				'q'      => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'status' => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'min'    => array( 'validate_callback' => 'is_numeric' ),
				'max'    => array( 'validate_callback' => 'is_numeric' ),
				'from'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'to'     => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'page'   => array( 'validate_callback' => 'is_numeric' ),
				'per_page'=> array( 'validate_callback' => 'is_numeric' ),
			),
		) );

		$this->route( '/bids/(?P<id>\d+)', array(
			'methods'             => WP_REST_Server::EDITABLE,
			'callback'            => array( $this, 'update' ),
			'permission_callback' => array( $this, 'must_manage_write' ),
			'args'                => array(
				'note' => array( 'required' => true, 'sanitize_callback' => 'sanitize_textarea_field' ),
			),
		) );

		$this->route( '/bids/bulk-tag-lost', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'bulk_tag_lost' ),
			'permission_callback' => array( $this, 'must_manage_write' ),
			'args'                => array(
				'ids' => array( 'required' => true ),
			),
		) );
	}

	public function must_manage() {
		$this->require_logged_in();
		if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'manage_options' ) ) {
			throw new Forbidden_Exception();
		}
		return true;
	}

	public function must_manage_write( $req ) {
		$this->must_manage();
		$this->require_rest_nonce( $req );
		return true;
	}

	public function index( WP_REST_Request $request ) {
		global $wpdb;

		$table = $wpdb->prefix . 'wc_auction_bids';
		$exists = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table ) );
		if ( ! $exists ) {
			return array( 'total' => 0, 'rows' => array() );
		}

		$q        = sanitize_text_field( (string) $request->get_param( 'q' ) );
		$status   = sanitize_text_field( (string) $request->get_param( 'status' ) );
		$min      = $request->get_param( 'min' );
		$max      = $request->get_param( 'max' );
		$from     = sanitize_text_field( (string) $request->get_param( 'from' ) );
		$to       = sanitize_text_field( (string) $request->get_param( 'to' ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;

		$where = ' WHERE 1=1 ';
		$args  = array();

		if ( $q ) {
			$where .= ' AND (lot_title LIKE %s OR bidder_name LIKE %s OR bidder_email LIKE %s) ';
			$like   = '%' . $wpdb->esc_like( $q ) . '%';
			$args[] = $like; $args[] = $like; $args[] = $like;
		}
		if ( $status && in_array( $status, array( 'leading','outbid','won','lost' ), true ) ) {
			$where .= ' AND status = %s ';
			$args[] = $status;
		}
		if ( is_numeric( $min ) ) { $where .= ' AND amount >= %f '; $args[] = (float) $min; }
		if ( is_numeric( $max ) ) { $where .= ' AND amount <= %f '; $args[] = (float) $max; }
		if ( $from ) { $where .= ' AND placed_at >= %s '; $args[] = $from; }
		if ( $to )   { $where .= ' AND placed_at <= %s '; $args[] = $to; }

		$sql  = "SELECT SQL_CALC_FOUND_ROWS * FROM {$table} {$where} ORDER BY placed_at DESC LIMIT %d OFFSET %d";
		$args = array_merge( $args, array( $per_page, $offset ) );

		$rows  = $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A );
		$total = (int) $wpdb->get_var( 'SELECT FOUND_ROWS()' );

		return array(
			'total' => $total,
			'rows'  => array_map( array( $this, 'map_bid' ), $rows ),
		);
	}

	public function update( WP_REST_Request $request ) {
		global $wpdb;
		$this->require_rest_nonce( $request );

		$id   = (int) $request['id'];
		$note = sanitize_textarea_field( (string) $request->get_param( 'note' ) );

		$table = $wpdb->prefix . 'wc_auction_bids';
		$ok    = $wpdb->update( $table, array( 'note' => $note ), array( 'id' => $id ), array( '%s' ), array( '%d' ) );
		if ( false === $ok ) {
			throw new Validation_Exception( __( 'Failed to update note.', 'wp-auction-manager' ) );
		}
		return array( 'id' => $id, 'note' => $note );
	}

	public function bulk_tag_lost( WP_REST_Request $request ) {
		global $wpdb;
		$this->require_rest_nonce( $request );

		$ids = (array) $request->get_param( 'ids' );
		$ids = array_filter( array_map( 'absint', $ids ) );
		if ( empty( $ids ) ) {
			throw new Validation_Exception( __( 'No bid ids provided.', 'wp-auction-manager' ) );
		}
		$in = implode( ',', array_map( 'intval', $ids ) );

		$table = $wpdb->prefix . 'wc_auction_bids';
		$sql   = "UPDATE {$table} SET status = 'lost' WHERE id IN ({$in})";
		$ok    = $wpdb->query( $sql );
		if ( false === $ok ) {
			throw new Validation_Exception( __( 'Bulk update failed.', 'wp-auction-manager' ) );
		}
		return array( 'updated' => count( $ids ) );
	}

	private function map_bid( array $r ) {
		return array(
			'id'       => (int) $r['id'],
			'auction'  => (string) $r['auction_title'],
			'lot'      => (string) $r['lot_label'],
			'bidder'   => (string) $r['bidder_name'],
			'email'    => (string) $r['bidder_email'],
			'amount'   => (float) $r['amount'],
			'placedAt' => (string) $r['placed_at'],
			'status'   => (string) $r['status'],
			'note'     => isset( $r['note'] ) ? (string) $r['note'] : '',
		);
	}
}
