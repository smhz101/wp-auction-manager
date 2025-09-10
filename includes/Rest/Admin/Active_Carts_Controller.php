<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest\Admin;

use WP_REST_Request;
use WP_REST_Server;
use WPAM\Includes\Rest\Base_Controller;
use WPAM\Includes\Support\Exceptions\Forbidden_Exception;
use WPAM\Includes\Support\Exceptions\Validation_Exception;

/**
 * NOTE: Implementation depends on where carts are stored.
 * If you have a custom table (e.g., {$wpdb->prefix}wpam_carts), query it here.
 * Below returns an empty list if table is missing—safe for UI.
 */
final class Active_Carts_Controller extends Base_Controller {

	public function register_routes() {
		// List
		$this->route( '/carts', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'index' ),
			'permission_callback' => array( $this, 'must_manage' ),
			'args'                => array(
				'q'      => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'status' => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'from'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'to'     => array( 'sanitize_callback' => 'sanitize_text_field' ),
				'page'   => array( 'validate_callback' => 'is_numeric' ),
				'per_page'=> array( 'validate_callback' => 'is_numeric' ),
			),
		) );

		// Update note
		$this->route( '/carts/(?P<id>[a-zA-Z0-9\-]+)', array(
			'methods'             => WP_REST_Server::EDITABLE,
			'callback'            => array( $this, 'update' ),
			'permission_callback' => array( $this, 'must_manage_write' ),
			'args'                => array(
				'note' => array( 'required' => true, 'sanitize_callback' => 'sanitize_textarea_field' ),
			),
		) );

		// Bulk status
		$this->route( '/carts/bulk-status', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'bulk_status' ),
			'permission_callback' => array( $this, 'must_manage_write' ),
			'args'                => array(
				'ids'    => array( 'required' => true ),
				'status' => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
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

		$table = $wpdb->prefix . 'wpam_carts';
		$exists = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table ) );
		if ( ! $exists ) {
			return array( 'total' => 0, 'rows' => array() );
		}

		$q        = sanitize_text_field( (string) $request->get_param( 'q' ) );
		$status   = sanitize_text_field( (string) $request->get_param( 'status' ) );
		$from     = sanitize_text_field( (string) $request->get_param( 'from' ) );
		$to       = sanitize_text_field( (string) $request->get_param( 'to' ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) );
		$offset   = ( $page - 1 ) * $per_page;

		$where = ' WHERE 1=1 ';
		$args  = array();

		if ( $q ) {
			$where .= ' AND (customer LIKE %s OR email LIKE %s) ';
			$like   = '%' . $wpdb->esc_like( $q ) . '%';
			$args[] = $like;
			$args[] = $like;
		}
		if ( $status && in_array( $status, array( 'active','abandoned','recovering' ), true ) ) {
			$where .= ' AND status = %s ';
			$args[] = $status;
		}
		if ( $from ) {
			$where .= ' AND updated_at >= %s ';
			$args[] = $from;
		}
		if ( $to ) {
			$where .= ' AND updated_at <= %s ';
			$args[] = $to;
		}

		$sql  = "SELECT SQL_CALC_FOUND_ROWS * FROM {$table} {$where} ORDER BY updated_at DESC LIMIT %d OFFSET %d";
		$args = array_merge( $args, array( $per_page, $offset ) );

		$rows  = $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A );
		$total = (int) $wpdb->get_var( 'SELECT FOUND_ROWS()' );

		return array(
			'total' => $total,
			'rows'  => array_map( array( $this, 'map_cart_row' ), $rows ),
		);
	}

	public function update( WP_REST_Request $request ) {
		global $wpdb;
		$this->require_rest_nonce( $request );

		$id    = sanitize_text_field( (string) $request['id'] );
		$note  = sanitize_textarea_field( (string) $request->get_param( 'note' ) );

		$table = $wpdb->prefix . 'wpam_carts';
		$ok    = $wpdb->update( $table, array( 'note' => $note ), array( 'id' => $id ) );
		if ( false === $ok ) {
			throw new Validation_Exception( __( 'Failed to update cart note.', 'wp-auction-manager' ) );
		}
		return array( 'id' => $id, 'note' => $note );
	}

	public function bulk_status( WP_REST_Request $request ) {
		global $wpdb;
		$this->require_rest_nonce( $request );

		$ids    = (array) $request->get_param( 'ids' );
		$status = sanitize_text_field( (string) $request->get_param( 'status' ) );
		if ( ! in_array( $status, array( 'active','abandoned','recovering' ), true ) ) {
			throw new Validation_Exception( __( 'Invalid status.', 'wp-auction-manager' ) );
		}
		$ids = array_filter( array_map( 'sanitize_text_field', $ids ) );
		if ( empty( $ids ) ) {
			throw new Validation_Exception( __( 'No cart ids provided.', 'wp-auction-manager' ) );
		}

		$table = $wpdb->prefix . 'wpam_carts';
		$in    = "'" . implode( "','", array_map( 'esc_sql', $ids ) ) . "'";
		$sql   = "UPDATE {$table} SET status = %s WHERE id IN ({$in})";
		$ok    = $wpdb->query( $wpdb->prepare( $sql, $status ) );
		if ( false === $ok ) {
			throw new Validation_Exception( __( 'Bulk update failed.', 'wp-auction-manager' ) );
		}
		return array( 'updated' => count( $ids ) );
	}

	private function map_cart_row( array $r ) {
		return array(
			'id'        => (string) $r['id'],
			'customer'  => (string) $r['customer'],
			'email'     => (string) $r['email'],
			'items'     => (int) $r['items'],
			'total'     => (float) $r['total'],
			'updatedAt' => (string) $r['updated_at'],
			'status'    => (string) $r['status'],
			'note'      => isset( $r['note'] ) ? (string) $r['note'] : '',
		);
	}
}
