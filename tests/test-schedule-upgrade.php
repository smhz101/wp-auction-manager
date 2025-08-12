<?php
use WPAM\Includes\WPAM_Install;

class Test_WPAM_Install_Schedule extends WP_UnitTestCase {
	public function test_reschedules_pending_events() {
		WPAM_Install::activate();

		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);

		$start = gmdate( 'Y-m-d H:i:s', time() + 3600 );
		$end   = gmdate( 'Y-m-d H:i:s', time() + 7200 );
		update_post_meta( $auction_id, '_auction_start', $start );
		update_post_meta( $auction_id, '_auction_end', $end );

		// Schedule incorrect timestamps to mimic previous offset behaviour.
		$wrong_start = time() + 1800;
		$wrong_end   = time() + 5400;
		wp_schedule_single_event( $wrong_start, 'wpam_auction_start', array( $auction_id ) );
		wp_schedule_single_event( $wrong_end, 'wpam_auction_end', array( $auction_id ) );

		// Activation should clear and reschedule events using UTC.
		WPAM_Install::activate();

		$scheduled_start = wp_next_scheduled( 'wpam_auction_start', array( $auction_id ) );
		$scheduled_end   = wp_next_scheduled( 'wpam_auction_end', array( $auction_id ) );

		$expected_start = ( new DateTimeImmutable( $start, new DateTimeZone( 'UTC' ) ) )->getTimestamp();
		$expected_end   = ( new DateTimeImmutable( $end, new DateTimeZone( 'UTC' ) ) )->getTimestamp();

		$this->assertSame( $expected_start, $scheduled_start );
		$this->assertSame( $expected_end, $scheduled_end );
	}

	public function test_update_reschedules_pending_events() {
		WPAM_Install::activate();

		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);

		$start = gmdate( 'Y-m-d H:i:s', time() + 3600 );
		$end   = gmdate( 'Y-m-d H:i:s', time() + 7200 );
		update_post_meta( $auction_id, '_auction_start', $start );
		update_post_meta( $auction_id, '_auction_end', $end );

		$wrong_start = time() + 1800;
		$wrong_end   = time() + 5400;
		wp_schedule_single_event( $wrong_start, 'wpam_auction_start', array( $auction_id ) );
		wp_schedule_single_event( $wrong_end, 'wpam_auction_end', array( $auction_id ) );

		update_option( 'wpam_version', '0.0.1' );
		wpam_plugins_loaded();

		$scheduled_start = wp_next_scheduled( 'wpam_auction_start', array( $auction_id ) );
		$scheduled_end   = wp_next_scheduled( 'wpam_auction_end', array( $auction_id ) );

		$expected_start = ( new DateTimeImmutable( $start, new DateTimeZone( 'UTC' ) ) )->getTimestamp();
		$expected_end   = ( new DateTimeImmutable( $end, new DateTimeZone( 'UTC' ) ) )->getTimestamp();

		$this->assertSame( $expected_start, $scheduled_start );
		$this->assertSame( $expected_end, $scheduled_end );
	}
}
