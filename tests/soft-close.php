<?php
use WPAM\Includes\WPAM_Soft_Close;

class Test_Soft_Close extends WP_UnitTestCase {
	public function test_extends_within_threshold() {
		$auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		$end_ts     = time() + 30; // 30 seconds in future
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', $end_ts ) );
		update_option( 'wpam_soft_close_threshold', 60 );
		update_option( 'wpam_soft_close_extend', 120 );
		update_option( 'wpam_max_extensions', 0 );

		$result = WPAM_Soft_Close::maybe_extend_end( $auction_id, $end_ts, $end_ts - 10 );
		$this->assertTrue( $result['extended'] );
		$this->assertEquals( $end_ts + 120, $result['new_end_ts'] );
	}

	public function test_respects_max_extensions() {
		$auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $auction_id, '_auction_extension_count', 1 );
		$end_ts = time() + 30;
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', $end_ts ) );

		update_option( 'wpam_soft_close_threshold', 60 );
		update_option( 'wpam_soft_close_extend', 120 );
		update_option( 'wpam_max_extensions', 1 );

		$result = WPAM_Soft_Close::maybe_extend_end( $auction_id, $end_ts, $end_ts - 10 );
		$this->assertFalse( $result['extended'] );
		$this->assertEquals( $end_ts, $result['new_end_ts'] );
	}
}
