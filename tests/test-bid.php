<?php
class Test_WPAM_Bid extends WP_Ajax_UnitTestCase {
    public function set_up() : void {
        parent::set_up();
        new WPAM_Bid();
    }

    public function test_place_bid_invalid_data() {
        $_POST = [ 'nonce' => wp_create_nonce( 'wpam_place_bid' ) ];
        try {
            $this->_handleAjax( 'wpam_place_bid' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertFalse( $response['success'] );
            $this->assertSame( 'Invalid bid data', $response['data']['message'] );
            return;
        }
        $this->fail( 'Expected AJAX die.' );
    }

    public function test_place_bid_requires_login() {
        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => 1,
            'bid'        => 1,
        ];
        try {
            $this->_handleAjax( 'wpam_place_bid' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertFalse( $response['success'] );
            $this->assertSame( 'Please login', $response['data']['message'] );
            return;
        }
        $this->fail( 'Expected AJAX die.' );
    }
}
