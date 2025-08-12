<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Install;

class Test_WPAM_Audit_Log extends WP_Ajax_UnitTestCase {
	protected $auction_id;
	protected $user_id;
	protected $bid;

	public function set_up(): void {
		parent::set_up();
		$this->bid = new WPAM_Bid();
		WPAM_Install::activate();
		$this->auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $this->auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $this->auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		$this->user_id = $this->factory->user->create();
		wp_set_current_user( $this->user_id );
	}

	public function test_log_created_on_bid() {
		$_SERVER['REMOTE_ADDR']     = '127.0.0.1';
		$_SERVER['HTTP_USER_AGENT'] = 'phpunit';
		$_POST                      = array(
			'nonce'      => wp_create_nonce( 'wpam_place_bid' ),
			'auction_id' => $this->auction_id,
			'bid'        => 5,
		);
		try {
			$this->_handleAjax( 'wpam_place_bid' );
		} catch ( WPAjaxDieContinueException $e ) {
		}

		global $wpdb;
		$audit_table = $wpdb->prefix . 'wc_auction_audit';
		$count       = $wpdb->get_var( "SELECT COUNT(*) FROM $audit_table" );
		$this->assertSame( 1, intval( $count ) );

		$logs = $this->bid->get_recent_logs_for_user( $this->user_id );
		$this->assertCount( 1, $logs );
		$this->assertSame( '127.0.0.1', $logs[0]['ip'] );
	}
}
