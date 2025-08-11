<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Capability manager for WP Auction Manager.
 */
class WPAM_Capabilities {
	/**
	 * Map of capabilities to the roles that should receive them.
	 *
	 * @var array
	 */
	private static $capability_map = array(
		'auction_seller' => array( 'auction_seller', 'administrator' ),
		'auction_bidder' => array( 'auction_bidder', 'administrator' ),
	);

	/**
	 * Register custom roles and capabilities on plugin activation.
	 */
	public static function register_caps() {
		add_role(
			'auction_seller',
			__( 'Auction Seller', 'wpam' ),
			array( 'read' => true )
		);

		add_role(
			'auction_bidder',
			__( 'Auction Bidder', 'wpam' ),
			array( 'read' => true )
		);

		self::assign_caps_to_roles();
	}

	/**
	 * Ensure that all capabilities are assigned to the appropriate roles.
	 */
	public static function assign_caps_to_roles() {
		foreach ( self::$capability_map as $cap => $roles ) {
			foreach ( $roles as $role_name ) {
				$role = get_role( $role_name );
				if ( $role && ! $role->has_cap( $cap ) ) {
					$role->add_cap( $cap );
				}
			}
		}
	}
}
