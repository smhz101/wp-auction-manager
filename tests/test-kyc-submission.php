<?php
use WPAM\Includes\WPAM_Install;
use WPAM\Includes\WPAM_KYC;

class Test_WPAM_KYC_Submission extends WP_UnitTestCase {
	protected $user_id;

	public function set_up(): void {
		parent::set_up();
		WPAM_Install::activate();
		new WPAM_KYC();
		do_action( 'rest_api_init' );
		$this->user_id = $this->factory->user->create();
		wp_set_current_user( $this->user_id );
		global $wpdb;
		$wpdb->query( 'DELETE FROM ' . $wpdb->prefix . 'wc_kyc_failures' );
	}

	public function test_invalid_nonce_is_logged() {
		$request = new WP_REST_Request( 'POST', '/wpam/v1/kyc' );
		$request->set_param( 'id_document', 'doc' );
		$request->set_header( 'X-WP-Nonce', 'bad' );
		$response = rest_do_request( $request );
		$this->assertSame( 403, $response->get_status() );
		global $wpdb;
		$table = $wpdb->prefix . 'wc_kyc_failures';
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
		$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $table WHERE reason = 'invalid_nonce'" );
		$this->assertSame( 1, $count );
	}

	public function test_missing_read_capability_is_logged() {
		$nonce = wp_create_nonce( 'wp_rest' );
		wp_update_user(
			array(
				'ID'   => $this->user_id,
				'role' => '',
			)
		);
		$request = new WP_REST_Request( 'POST', '/wpam/v1/kyc' );
		$request->set_param( 'id_document', 'doc' );
		$request->set_header( 'X-WP-Nonce', $nonce );
		$response = rest_do_request( $request );
		$this->assertSame( 403, $response->get_status() );
		global $wpdb;
		$table = $wpdb->prefix . 'wc_kyc_failures';
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
		$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $table WHERE reason = 'missing_read_capability'" );
		$this->assertSame( 1, $count );
	}
}
