<?php
use WPAM\Includes\WPAM_Watchlist;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_Watchlist extends WP_Ajax_UnitTestCase {
	protected $auction_id;
	public function set_up(): void {
		parent::set_up();
		new WPAM_Watchlist();
		WPAM_Install::activate();
		$this->auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		$user_id          = $this->factory->user->create();
		wp_set_current_user( $user_id );
	}

	public function test_toggle_watchlist() {
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_toggle_watchlist' ),
			'auction_id' => $this->auction_id,
		);
		try {
			$this->_handleAjax( 'wpam_toggle_watchlist' );
		} catch ( WPAjaxDieContinueException $e ) {
			$first = json_decode( $this->_last_response, true );
		}
		$this->assertTrue( $first['success'] );
		$this->assertSame( 'Added to watchlist', $first['data']['message'] );

		try {
			$this->_handleAjax( 'wpam_toggle_watchlist' );
		} catch ( WPAjaxDieContinueException $e ) {
			$second = json_decode( $this->_last_response, true );
		}
		$this->assertTrue( $second['success'] );
		$this->assertSame( 'Removed from watchlist', $second['data']['message'] );
	}

	public function test_get_watchlist_requires_login() {
		wp_set_current_user( 0 );
		$_POST = array( 'nonce' => wp_create_nonce( 'wpam_get_watchlist' ) );
		try {
			$this->_handleAjax( 'wpam_get_watchlist' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertFalse( $response['success'] );
			$this->assertSame( 'Please login', $response['data']['message'] );
			return;
		}
		$this->fail( 'Expected AJAX die.' );
	}

	public function test_get_watchlist_returns_items() {
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_toggle_watchlist' ),
			'auction_id' => $this->auction_id,
		);
		try {
			$this->_handleAjax( 'wpam_toggle_watchlist' );
		} catch ( WPAjaxDieContinueException $e ) {
			// Ignore result
		}

		$_POST = array( 'nonce' => wp_create_nonce( 'wpam_get_watchlist' ) );
		try {
			$this->_handleAjax( 'wpam_get_watchlist' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertTrue( $response['success'] );
		$this->assertCount( 1, $response['data']['items'] );
		$this->assertSame( $this->auction_id, $response['data']['items'][0]['id'] );
	}
}
