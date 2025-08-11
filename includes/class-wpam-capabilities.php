<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Capability/role manager for WP Auction Manager.
 *
 * Notes:
 * - Users can have multiple roles (e.g., both "auction_seller" and "auction_bidder").
 *   See WP_User::add_role(): https://developer.wordpress.org/reference/classes/wp_user/add_role/
 */
class WPAM_Capabilities {

	/** Seller role slug */
	const ROLE_SELLER = 'auction_seller';

	/** Bidder role slug */
	const ROLE_BIDDER = 'auction_bidder';

	/**
	 * Core capabilities mirroring custom post type defaults.
	 *
	 * @return string[]
	 */
	public static function get_core_capabilities() {
		return array(
			'edit_auction',
			'read_auction',
			'delete_auction',
			'edit_auctions',
			'edit_others_auctions',
			'publish_auctions',
			'read_private_auctions',
			'delete_auctions',
			'delete_private_auctions',
			'delete_published_auctions',
			'delete_others_auctions',
			'edit_private_auctions',
			'edit_published_auctions',
		);
	}

	/**
	 * Capabilities granted to administrators and shop managers.
	 *
	 * @return string[]
	 */
	public static function get_admin_capabilities() {
		return array_merge(
			self::get_core_capabilities(),
			array(
				'auction_seller',
				'auction_bidder',
			)
		);
	}

	/**
	 * Capabilities granted to auction sellers.
	 *
	 * @return string[]
	 */
	public static function get_seller_capabilities() {
		return array(
			'auction_seller',
			'edit_auction',
			'read_auction',
			'delete_auction',
			'edit_auctions',
			'publish_auctions',
			'delete_auctions',
			'edit_published_auctions',
			'delete_published_auctions',
		);
	}

	/**
	 * Capabilities granted to auction bidders.
	 *
	 * @return string[]
	 */
	public static function get_bidder_capabilities() {
		return array(
			'auction_bidder',
			'read_auction',
		);
	}

	/**
	 * Install/refresh roles & capabilities.
	 *
	 * Use on plugin activation AND optionally on 'init' to heal missing caps.
	 * - Defines/updates the "auction_seller" and "auction_bidder" roles with full caps.
	 * - Grants admin/shop_manager the admin-level caps.
	 */
	public static function register_roles_and_caps() {
		// 1) Add/update Seller role with its capabilities.
		$seller_caps         = array_fill_keys( self::get_seller_capabilities(), true );
		$seller_caps['read'] = true; // baseline.
		self::upsert_role( self::ROLE_SELLER, __( 'Auction Seller', 'wpam' ), $seller_caps );

		// 2) Add/update Bidder role with its capabilities.
		$bidder_caps         = array_fill_keys( self::get_bidder_capabilities(), true );
		$bidder_caps['read'] = true; // baseline.
		self::upsert_role( self::ROLE_BIDDER, __( 'Auction Bidder', 'wpam' ), $bidder_caps );

		// 3) Ensure admin/shop_manager have all admin-level caps.
		self::grant_caps_to_role( 'administrator', self::get_admin_capabilities() );
		self::grant_caps_to_role( 'shop_manager',  self::get_admin_capabilities() );
	}

	/**
	 * Create role if missing; otherwise ensure it has all desired caps.
	 *
	 * @param string $role_slug Role slug.
	 * @param string $display_name Translatable display name.
	 * @param array  $caps Map of 'capability' => bool.
	 *
	 * @return void
	 *
	 * @see add_role() https://developer.wordpress.org/reference/functions/add_role/
	 * @see get_role() https://developer.wordpress.org/reference/functions/get_role/
	 * @see WP_Role::add_cap() https://developer.wordpress.org/reference/classes/wp_role/add_cap/
	 */
	private static function upsert_role( $role_slug, $display_name, array $caps ) {
		$role = get_role( $role_slug );

		if ( ! $role ) {
			// Role doesn't exist; create with full capabilities.
			add_role( $role_slug, $display_name, $caps );
			return;
		}

		// Role exists; ensure all capabilities are present.
		foreach ( $caps as $cap => $grant ) {
			if ( $grant && ! $role->has_cap( $cap ) ) {
				$role->add_cap( $cap, true );
			}
		}
	}

	/**
	 * Grant a list of capabilities to a role if the role exists.
	 *
	 * @param string   $role_slug Role slug (e.g., 'administrator').
	 * @param string[] $caps      List of capability strings.
	 *
	 * @return void
	 */
	private static function grant_caps_to_role( $role_slug, array $caps ) {
		$role = get_role( $role_slug );
		if ( ! $role ) {
			return;
		}
		foreach ( $caps as $cap ) {
			if ( ! $role->has_cap( $cap ) ) {
				$role->add_cap( $cap, true );
			}
		}
	}
}