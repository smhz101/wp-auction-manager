<?php
class Test_WPAM_Bid_Status extends WP_Ajax_UnitTestCase {
    public function set_up() : void {
        parent::set_up();
        new WPAM_Bid();
    }

    public function test_bid_fails_not_started() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() + 3600 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 7200 ) );
        $user_id = $this->factory->user->create();
        wp_set_current_user( $user_id );
        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $auction_id,
            'bid'        => 5,
        ];
        try {
            $this->_handleAjax( 'wpam_place_bid' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertFalse( $response['success'] );
            $this->assertSame( 'Auction not active', $response['data']['message'] );
            return;
        }
        $this->fail( 'Expected AJAX die.' );
    }

    public function test_bid_fails_expired() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 7200 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() - 3600 ) );
        $user_id = $this->factory->user->create();
        wp_set_current_user( $user_id );
        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $auction_id,
            'bid'        => 5,
        ];
        try {
            $this->_handleAjax( 'wpam_place_bid' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertFalse( $response['success'] );
            $this->assertSame( 'Auction not active', $response['data']['message'] );
            return;
        }
        $this->fail( 'Expected AJAX die.' );
    }
}
