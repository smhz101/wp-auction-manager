<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_Auction_Types extends WP_Ajax_UnitTestCase {
    protected $bid;
    public function set_up() : void {
        parent::set_up();
        $this->bid = new WPAM_Bid();
        WPAM_Install::activate();
    }

    public function test_reverse_lowest_bid_wins() {
        $auction_id = $this->factory->post->create([ 'post_type' => 'product' ]);
        update_post_meta( $auction_id, '_auction_type', 'reverse' );
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
        $user_id = $this->factory->user->create();
        wp_set_current_user( $user_id );

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $auction_id,
            'bid'        => 100,
        ];
        try { $this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {}

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $auction_id,
            'bid'        => 120,
        ];
        try { $this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {
            $resp = json_decode( $this->_last_response, true );
            $this->assertFalse( $resp['success'] );
            $this->assertSame( 'Bid too high', $resp['data']['message'] );
        }

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $auction_id,
            'bid'        => 90,
        ];
        try { $this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {
            $resp = json_decode( $this->_last_response, true );
            $this->assertTrue( $resp['success'] );
        }

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_get_highest_bid' ),
            'auction_id' => $auction_id,
        ];
        try { $this->_handleAjax( 'wpam_get_highest_bid' ); } catch ( WPAjaxDieContinueException $e ) {
            $resp = json_decode( $this->_last_response, true );
        }
        $this->assertSame( 90.0, floatval( $resp['data']['highest_bid'] ) );
    }

    public function test_sealed_bid_hidden_until_end() {
        $auction_id = $this->factory->post->create([ 'post_type' => 'product' ]);
        update_post_meta( $auction_id, '_auction_type', 'sealed' );
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
        $user_id = $this->factory->user->create();
        wp_set_current_user( $user_id );

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $auction_id,
            'bid'        => 50,
        ];
        try { $this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {}

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_get_highest_bid' ),
            'auction_id' => $auction_id,
        ];
        try { $this->_handleAjax( 'wpam_get_highest_bid' ); } catch ( WPAjaxDieContinueException $e ) {
            $resp = json_decode( $this->_last_response, true );
        }
        $this->assertSame( 0.0, floatval( $resp['data']['highest_bid'] ) );

        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() - 10 ) );

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_get_highest_bid' ),
            'auction_id' => $auction_id,
        ];
        try { $this->_handleAjax( 'wpam_get_highest_bid' ); } catch ( WPAjaxDieContinueException $e ) {
            $resp = json_decode( $this->_last_response, true );
        }
        $this->assertSame( 50.0, floatval( $resp['data']['highest_bid'] ) );
    }
}
