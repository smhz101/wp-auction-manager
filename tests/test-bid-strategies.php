<?php
use WPAM\Includes\WPAM_Bid;

class Test_WPAM_Bid_Strategies extends WP_Ajax_UnitTestCase {
	public function set_up(): void {
		parent::set_up();
		update_option( 'wpam_enable_proxy_bidding', 0 );
		update_option( 'wpam_enable_silent_bidding', 0 );
		new WPAM_Bid();
	}

	public function test_standard_bid_too_low() {
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );

		$u1 = $this->factory->user->create();
		$u2 = $this->factory->user->create();

		wp_set_current_user( $u1 );
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $auction_id,
			'bid'        => 10,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {
			}

			wp_set_current_user( $u2 );
			$_POST = array(
				'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
				'auction_id' => $auction_id,
				'bid'        => 10,
			);
			try {
				$this->_handleAjax( 'wpam_place_bid' );
			} catch ( WPAjaxDieContinueException $e ) {
				$response = json_decode( $this->_last_response, true );
				$this->assertFalse( $response['success'] );
				$this->assertSame( 'Bid too low. Minimum bid is 11', $response['data']['message'] );
				$this->assertSame( 11.0, $response['data']['min_bid'] );
				return;
			}
			$this->fail( 'Expected AJAX die.' );
	}

	public function test_proxy_max_bid_reached() {
		update_option( 'wpam_enable_proxy_bidding', 1 );
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $auction_id, '_auction_proxy_bidding', 1 );

		$u1 = $this->factory->user->create();
		$u2 = $this->factory->user->create();

		wp_set_current_user( $u1 );
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $auction_id,
			'bid'        => 10,
			'max_bid'    => 100,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {
			}

			wp_set_current_user( $u2 );
			$_POST = array(
				'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
				'auction_id' => $auction_id,
				'bid'        => 20,
				'max_bid'    => 20,
			);
			try {
				$this->_handleAjax( 'wpam_place_bid' );
			} catch ( WPAjaxDieContinueException $e ) {
				$response = json_decode( $this->_last_response, true );
				$this->assertTrue( $response['success'] );
				$this->assertSame( 'Max bid reached', $response['data']['message'] );
				$this->assertTrue( $response['data']['max_reached'] );
				return;
			}
			$this->fail( 'Expected AJAX die.' );
	}

	public function test_sealed_allows_only_one_bid() {
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $auction_id, '_auction_type', 'sealed' );

		$u1 = $this->factory->user->create();
		wp_set_current_user( $u1 );

		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $auction_id,
			'bid'        => 10,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {
			}

			$_POST = array(
				'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
				'auction_id' => $auction_id,
				'bid'        => 20,
			);
			try {
				$this->_handleAjax( 'wpam_place_bid' );
			} catch ( WPAjaxDieContinueException $e ) {
				$response = json_decode( $this->_last_response, true );
				$this->assertFalse( $response['success'] );
				$this->assertSame( 'Only one bid allowed for sealed auctions', $response['data']['message'] );
				return;
			}
			$this->fail( 'Expected AJAX die.' );
	}

	public function test_silent_status_hidden() {
		update_option( 'wpam_enable_silent_bidding', 1 );
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $auction_id, '_auction_silent_bidding', 1 );

		$u1 = $this->factory->user->create();
		wp_set_current_user( $u1 );

		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $auction_id,
			'bid'        => 10,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertTrue( $response['success'] );
			$this->assertSame( array(), $response['data']['statuses'] );
			$this->assertSame( '', $response['data']['status'] );
			return;
		}
		$this->fail( 'Expected AJAX die.' );
	}
}
