<?php
use WPAM\Includes\WPAM_Install;
use WPAM\Includes\WPAM_Notifications;

class Test_WPAM_Notification_Retry extends WP_UnitTestCase {
	public function set_up(): void {
			parent::set_up();
			WPAM_Install::activate();
	}

	public function test_retry_scheduled_and_logged_on_failure() {
			$user_id = $this->factory->user->create( array( 'user_email' => 'test@example.com' ) );
			update_option( 'wpam_enable_email', '1' );
			update_option( 'wpam_enable_twilio', '0' );
			update_option( 'wpam_enable_firebase', '0' );
			add_filter( 'pre_wp_mail', '__return_false' );

			// Ensure no existing events
			wp_clear_scheduled_hook( 'wpam_send_notification' );

			WPAM_Notifications::process_notification( $user_id, 'Hello', 'Message', 0 );

			$timestamp = wp_next_scheduled( 'wpam_send_notification', array( $user_id, 'Hello', 'Message', 1 ) );
			$this->assertNotFalse( $timestamp );
			$expected = time() + MINUTE_IN_SECONDS;
			$this->assertEquals( $expected, $timestamp, '', 5 );

			global $wpdb;
			$table = $wpdb->prefix . 'wc_notification_logs';
			$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $table WHERE user_id = $user_id" );
			$this->assertSame( 1, $count );

			remove_filter( 'pre_wp_mail', '__return_false' );
	}
}
