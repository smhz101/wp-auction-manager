<?php
use WPAM\Includes\WPAM_HTML;

class Test_HTML_Countdown extends WP_UnitTestCase {
	public function test_countdown_skipped_for_inactive_status() {
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $auction_id, '_auction_type', 'normal' );
		update_post_meta( $auction_id, '_auction_state', 'ended' );

		$html = WPAM_HTML::render_auction_meta( $auction_id );

		$this->assertStringNotContainsString( 'wpam-countdown', $html );
		$this->assertStringContainsString( 'data-status="ended"', $html );
		$this->assertStringContainsString( 'data-start="', $html );
		$this->assertStringContainsString( 'data-end="', $html );
	}

	public function test_countdown_shown_for_active_status() {
		$auction_id = $this->factory->post->create(
			array(
				'post_type' => 'product',
			)
		);
		update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $auction_id, '_auction_type', 'normal' );
		update_post_meta( $auction_id, '_auction_state', 'active' );

		$html = WPAM_HTML::render_auction_meta( $auction_id );

		$this->assertStringContainsString( 'class="wpam-countdown"', $html );
		$this->assertStringContainsString( 'data-status="active"', $html );
		$this->assertStringContainsString( 'data-start="', $html );
		$this->assertStringContainsString( 'data-end="', $html );
	}
}
