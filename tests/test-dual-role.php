<?php
use WPAM\Includes\WPAM_Capabilities;

class Test_User_Dual_Role extends WP_UnitTestCase {
    public function test_user_can_be_seller_and_bidder() {
        WPAM_Capabilities::register_caps();
        $user_id = self::factory()->user->create();
        $user    = get_user_by( 'id', $user_id );
        $user->add_role( WPAM_Capabilities::ROLE_SELLER );
        $user->add_role( WPAM_Capabilities::ROLE_BIDDER );
        wp_set_current_user( $user_id );
        $this->assertTrue( current_user_can( 'auction_seller' ) );
        $this->assertTrue( current_user_can( 'auction_bidder' ) );
    }
}