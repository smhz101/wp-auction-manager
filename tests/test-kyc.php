<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_KYC extends WP_Ajax_UnitTestCase {
	protected $auction_id;
	protected $user_id;

	public function set_up(): void {
		parent::set_up();
		new WPAM_Bid();
		WPAM_Install::activate();
		update_option( 'wpam_require_kyc', 1 );
		$this->auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $this->auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $this->auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		$this->user_id = $this->factory->user->create();
		wp_set_current_user( $this->user_id );
	}

	public function test_bid_rejected_if_unverified() {
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 5,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertFalse( $response['success'] );
			$this->assertSame( 'Verification required', $response['data']['message'] );
			return;
		}
		$this->fail( 'Expected KYC verification requirement.' );
	}

	public function test_bid_allowed_when_verified() {
		update_user_meta( $this->user_id, 'wpam_kyc_verified', 1 );
		$_POST = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 5,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
			$this->assertTrue( $response['success'] );
			$this->assertSame( 'Bid received', $response['data']['message'] );
			return;
		}
		$this->fail( 'Expected bid success.' );
	}
}
