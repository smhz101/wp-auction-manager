<?php
/**
 * Test settings endpoint handles boolean values.
 */
class Settings_Endpoint_Test extends WP_UnitTestCase {
    public function test_boolean_settings_saved_and_returned() {
        do_action( 'rest_api_init' );
        $admin_id = self::factory()->user->create( ['role' => 'administrator'] );
        wp_set_current_user( $admin_id );

        $request = new WP_REST_Request( 'POST', '/wpam/v1/settings' );
        $request->set_header( 'Content-Type', 'application/json' );
        $request->set_body( wp_json_encode( [
            'wpam_enable_toasts' => true,
            'wpam_enable_twilio' => false,
        ] ) );

        $response = rest_get_server()->dispatch( $request );
        $this->assertSame( 200, $response->get_status() );

        $data = $response->get_data();
        $this->assertTrue( $data['wpam_enable_toasts'] );
        $this->assertFalse( $data['wpam_enable_twilio'] );

        $this->assertTrue( (bool) get_option( 'wpam_enable_toasts' ) );
        $this->assertFalse( (bool) get_option( 'wpam_enable_twilio' ) );
    }
}
