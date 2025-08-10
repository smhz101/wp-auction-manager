<?php
use WPAM\Public\WPAM_Public;
use WPAM\Includes\WPAM_Install;

/**
 * Tests for Pusher auth endpoint.
 */
class Test_WPAM_Pusher_Auth extends WP_Ajax_UnitTestCase {
	/**
	 * Set up test case.
	 */
	public function set_up(): void {
		parent::set_up();
		WPAM_Install::activate();
		update_option( 'wpam_realtime_provider', 'none' );
		new WPAM_Public();
	}

	/**
	 * Ensure pusher_auth rejects unauthenticated requests.
	 */
	public function test_pusher_auth_requires_login() {
		wp_set_current_user( 0 );
		$_POST = array(
			'nonce'        => wp_create_nonce( 'wpam_pusher_auth' ),
			'channel_name' => 'presence-auction-1',
			'socket_id'    => '123.456',
		);
		try {
			$this->_handleAjax( 'wpam_pusher_auth' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertFalse( $response['success'] );
			$this->assertSame( 'Please login', $response['data']['message'] );
			return;
		}
		$this->fail( 'Expected AJAX die.' );
	}
}
