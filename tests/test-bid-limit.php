<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_Bid_Limit extends WP_Ajax_UnitTestCase {
	protected $auction_id;
	protected $user_id;

	public function set_up(): void {
		parent::set_up();
		new WPAM_Bid();
		WPAM_Install::activate();
		$this->auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $this->auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $this->auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $this->auction_id, '_auction_max_bids', 1 );
		$this->user_id = $this->factory->user->create();
		wp_set_current_user( $this->user_id );
	}

	public function test_max_bids_enforced() {
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 5,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			// ignore first
		}

		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 6,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertFalse( $response['success'] );
			$this->assertSame( 'Bid limit reached', $response['data']['message'] );
			return;
		}
		$this->fail( 'Expected bid limit error' );
	}

	public function test_multiple_bids_allowed_when_limit_greater_than_one() {
		update_post_meta( $this->auction_id, '_auction_max_bids', 2 );

		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 5,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			// ignore first bid
		}

		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 6,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertTrue( $response['success'] );
			return;
		}
		$this->fail( 'Expected AJAX success' );
	}
}
