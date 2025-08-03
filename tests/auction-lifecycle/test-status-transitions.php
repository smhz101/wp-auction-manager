<?php
use WPAM\Includes\WPAM_Auction;
use WPAM\Includes\WPAM_Auction_State;

class Test_Auction_Status_Transitions extends WP_UnitTestCase {
    protected $auction;

    public function set_up(): void {
        parent::set_up();
        $this->auction = new WPAM_Auction();
    }

    public function test_live_status() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
        $state = $this->auction->determine_state( $auction_id );
        $this->assertSame( WPAM_Auction_State::LIVE, $state );
        $this->assertSame( 'live', get_post_meta( $auction_id, '_auction_status', true ) );
    }

    public function test_completed_status() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 7200 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() - 3600 ) );
        update_post_meta( $auction_id, '_auction_winner', 1 );
        $state = $this->auction->determine_state( $auction_id );
        $this->assertSame( WPAM_Auction_State::COMPLETED, $state );
        $this->assertSame( 'completed', get_post_meta( $auction_id, '_auction_status', true ) );
    }

    public function test_failed_status() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 7200 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() - 3600 ) );
        $state = $this->auction->determine_state( $auction_id );
        $this->assertSame( WPAM_Auction_State::FAILED, $state );
        $this->assertSame( 'failed', get_post_meta( $auction_id, '_auction_status', true ) );
    }

    public function test_canceled_status() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_status', 'canceled' );
        $state = $this->auction->determine_state( $auction_id );
        $this->assertSame( WPAM_Auction_State::CANCELED, $state );
    }

    public function test_missing_dates_defaults_to_scheduled() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);

        remove_all_actions( 'admin_notices' );

        $state = $this->auction->determine_state( $auction_id );

        $this->assertSame( WPAM_Auction_State::SCHEDULED, $state );
        $this->assertSame( 'scheduled', get_post_meta( $auction_id, '_auction_status', true ) );
        $this->assertNotFalse( has_action( 'admin_notices' ) );

        remove_all_actions( 'admin_notices' );
    }
}
