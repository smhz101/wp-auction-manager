<?php
use WPAM\Includes\WPAM_Watchlist;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_REST_Watchlist extends WP_UnitTestCase {
	protected $auction_id;

	public function set_up(): void {
		parent::set_up();
		WPAM_Install::activate();
		new WPAM_Watchlist();
		$this->auction_id = self::factory()->post->create( array( 'post_type' => 'product' ) );
		do_action( 'rest_api_init' );
	}

	public function test_toggle_watchlist_requires_authentication() {
		wp_set_current_user( 0 );
		$request = new WP_REST_Request( 'POST', '/wpam/v1/watchlist' );
		$request->set_param( 'auction_id', $this->auction_id );
		$request->set_param( 'nonce', wp_create_nonce( 'wpam_watchlist' ) );
		$response = rest_get_server()->dispatch( $request );
		$this->assertInstanceOf( 'WP_Error', $response );
		$this->assertSame( 403, $response->get_error_data()['status'] );
	}

	public function test_toggle_watchlist_succeeds_for_authenticated_user() {
		$user_id = self::factory()->user->create();
		wp_set_current_user( $user_id );
		$request = new WP_REST_Request( 'POST', '/wpam/v1/watchlist' );
		$request->set_param( 'auction_id', $this->auction_id );
		$request->set_param( 'nonce', wp_create_nonce( 'wpam_watchlist' ) );
		$response = rest_get_server()->dispatch( $request );
		$this->assertSame( 200, $response->get_status() );
	}

	public function test_get_watchlist_requires_authentication() {
		wp_set_current_user( 0 );
		$request = new WP_REST_Request( 'GET', '/wpam/v1/watchlist' );
		$request->set_param( 'nonce', wp_create_nonce( 'wpam_watchlist' ) );
		$response = rest_get_server()->dispatch( $request );
		$this->assertInstanceOf( 'WP_Error', $response );
		$this->assertSame( 403, $response->get_error_data()['status'] );
	}

	public function test_get_watchlist_succeeds_with_header_nonce() {
		$user_id = self::factory()->user->create();
		wp_set_current_user( $user_id );
		$add = new WP_REST_Request( 'POST', '/wpam/v1/watchlist' );
		$add->set_param( 'auction_id', $this->auction_id );
		$add->set_param( 'nonce', wp_create_nonce( 'wpam_watchlist' ) );
		rest_get_server()->dispatch( $add );

		$request = new WP_REST_Request( 'GET', '/wpam/v1/watchlist' );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wpam_watchlist' ) );
		$response = rest_get_server()->dispatch( $request );
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertCount( 1, $data['items'] );
		$this->assertSame( $this->auction_id, $data['items'][0]['id'] );
	}
}
