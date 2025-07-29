<?php
class Test_WPAM_Watchlist extends WP_Ajax_UnitTestCase {
    protected $auction_id;
    public function set_up() : void {
        parent::set_up();
        new WPAM_Watchlist();
        WPAM_Install::activate();
        $this->auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        $user_id = $this->factory->user->create();
        wp_set_current_user( $user_id );
    }

    public function test_toggle_watchlist() {
        $_POST = [
            'nonce' => wp_create_nonce( 'wpam_toggle_watchlist' ),
            'auction_id' => $this->auction_id,
        ];
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
}
