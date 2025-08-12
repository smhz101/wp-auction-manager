<?php
use WPAM\Includes\WPAM_Auction;
use WPAM\Includes\WPAM_Auction_State;

class Test_Auction_Relist_Count extends WP_UnitTestCase {
	protected $auction;

	public function set_up(): void {
		parent::set_up();
		$this->auction = new WPAM_Auction();
	}

	public function test_relist_stops_at_limit() {
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_auto_relist', 1 );
		update_post_meta( $auction_id, '_auction_relist_limit', 1 );
		update_post_meta( $auction_id, '_auction_relist_count', 0 );
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 7200 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() - 3600 ) );

		$this->auction->handle_auction_end( $auction_id );

		$this->assertSame( 'scheduled', get_post_meta( $auction_id, '_auction_status', true ) );
		$this->assertSame( WPAM_Auction_State::SCHEDULED, get_post_meta( $auction_id, '_auction_state', true ) );
		$this->assertSame( '1', get_post_meta( $auction_id, '_auction_relist_count', true ) );

		// Simulate the relisted auction ending again.
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 7200 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() - 3600 ) );

		$this->auction->handle_auction_end( $auction_id );

		$this->assertSame( 'failed', get_post_meta( $auction_id, '_auction_status', true ) );
		$this->assertSame( WPAM_Auction_State::FAILED, get_post_meta( $auction_id, '_auction_state', true ) );
		$this->assertSame( '1', get_post_meta( $auction_id, '_auction_relist_count', true ) );
	}
}
