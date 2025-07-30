<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_Variable_Increment extends WP_Ajax_UnitTestCase {
    protected $auction_id;
    protected $user_id;

    public function set_up() : void {
        parent::set_up();
        new WPAM_Bid();
        WPAM_Install::activate();
        $this->auction_id = $this->factory->post->create([ 'post_type' => 'product' ]);
        update_post_meta( $this->auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
        update_post_meta( $this->auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
        update_post_meta( $this->auction_id, '_auction_variable_increment', 1 );
        update_post_meta( $this->auction_id, '_auction_variable_increment_rules', "50|2\n100|5" );
        $this->user_id = $this->factory->user->create();
        wp_set_current_user( $this->user_id );
    }

    public function test_initial_increment_enforced() {
        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $this->auction_id,
            'bid'        => 1,
        ];
        try {
            $this->_handleAjax( 'wpam_place_bid' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertFalse( $response['success'] );
            $this->assertSame( 'Bid too low', $response['data']['message'] );
            return;
        }
        $this->fail( 'Expected low bid rejection' );
    }

    public function test_increment_changes_with_rules() {
        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $this->auction_id,
            'bid'        => 2,
        ];
        try { $this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {}

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $this->auction_id,
            'bid'        => 60,
        ];
        try { $this->_handleAjax( 'wpam_place_bid' ); } catch ( WPAjaxDieContinueException $e ) {}

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
            'auction_id' => $this->auction_id,
            'bid'        => 62,
        ];
        try {
            $this->_handleAjax( 'wpam_place_bid' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertFalse( $response['success'] );
            $this->assertSame( 'Bid too low', $response['data']['message'] );
            return;
        }
        $this->fail( 'Expected low bid rejection after threshold' );
    }
}
