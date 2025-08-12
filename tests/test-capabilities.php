<?php
use WPAM\Includes\WPAM_Capabilities;

class Test_WPAM_Capabilities extends WP_UnitTestCase {
	public function test_register_caps_adds_roles_and_caps() {
			remove_role( 'auction_seller' );
			remove_role( 'auction_bidder' );
			$admin = get_role( 'administrator' );
			$admin->remove_cap( 'auction_seller' );
			$admin->remove_cap( 'auction_bidder' );

			WPAM_Capabilities::register_caps();

			$seller = get_role( 'auction_seller' );
			$bidder = get_role( 'auction_bidder' );

			$this->assertNotNull( $seller );
			$this->assertNotNull( $bidder );
			$this->assertTrue( $seller->has_cap( 'auction_seller' ) );
			$this->assertTrue( $bidder->has_cap( 'auction_bidder' ) );
			$this->assertTrue( $admin->has_cap( 'auction_seller' ) );
			$this->assertTrue( $admin->has_cap( 'auction_bidder' ) );
	}

	public function test_assign_caps_to_roles_restores_caps() {
			WPAM_Capabilities::register_caps();
			$admin  = get_role( 'administrator' );
			$seller = get_role( 'auction_seller' );
			$admin->remove_cap( 'auction_seller' );
			$seller->remove_cap( 'auction_seller' );

			WPAM_Capabilities::assign_caps_to_roles();

			$this->assertTrue( $admin->has_cap( 'auction_seller' ) );
			$this->assertTrue( $seller->has_cap( 'auction_seller' ) );
	}
}
