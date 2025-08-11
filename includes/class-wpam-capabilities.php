<?php
/**
 * WP Auction Manager — Capabilities / Roles
 *
 * @package WPAM
 */

namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Capability/role manager for WP Auction Manager.
 *
 * Users can hold multiple roles (e.g., seller & bidder).
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
				'manage_auctions', // custom meta-cap for plugin UIs.
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
	 * Use on plugin activation and optionally on 'init' (idempotent).
	 */
	public static function register_caps() {
		// 1) Add/update Seller role with its capabilities.
		$seller_caps         = array_fill_keys( self::get_seller_capabilities(), true );
		$seller_caps['read'] = true;
		self::upsert_role( self::ROLE_SELLER, \__( 'Auction Seller', 'wpam' ), $seller_caps );

		// 2) Add/update Bidder role with its capabilities.
		$bidder_caps         = array_fill_keys( self::get_bidder_capabilities(), true );
		$bidder_caps['read'] = true;
		self::upsert_role( self::ROLE_BIDDER, \__( 'Auction Bidder', 'wpam' ), $bidder_caps );

		// 3) Ensure admin/shop_manager have all admin-level caps (if roles exist).
		self::grant_caps_to_role( 'administrator', self::get_admin_capabilities() );
		self::grant_caps_to_role( 'shop_manager',  self::get_admin_capabilities() );
	}

	/**
	 * Back-compat shim.
	 *
	 * @deprecated 1.0.4 Use register_caps().
	 */
	public static function register_roles_and_caps() {
		// Properly mark as deprecated while still delegating.
		if ( \function_exists( '_deprecated_function' ) ) {
			\_deprecated_function( __METHOD__, '1.0.4', __CLASS__ . '::register_caps' );
		}
		self::register_caps();
	}

	/**
	 * Create role if missing; otherwise ensure it has all desired caps.
	 *
	 * @param string $role_slug Role slug.
	 * @param string $display_name Translatable display name.
	 * @param array  $caps Map of 'capability' => bool.
	 * @return void
	 */
	private static function upsert_role( $role_slug, $display_name, array $caps ) {
		$role = \get_role( $role_slug );

		if ( ! $role ) {
			\add_role( $role_slug, $display_name, $caps );
			return;
		}

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
	 * @param string[] $caps      Capabilities to grant.
	 * @return void
	 */
	private static function grant_caps_to_role( $role_slug, array $caps ) {
		$role = \get_role( $role_slug );
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