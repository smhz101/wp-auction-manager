<?php
declare(strict_types=1);

namespace WPAM\Includes\Services;

use WP_User;

final class Current_User_Service {

	/**
	 * Build a safe snapshot of the current user for the UI.
	 *
	 * @return array{
	 *   id:int,
	 *   name:string,
	 *   email:string,
	 *   roles:string[],
	 *   capabilities:string[],
	 *   avatar:string,
	 *   is_super_admin:bool
	 * }
	 */
	public function snapshot(): array {
		/** @var WP_User $u */
		$u = wp_get_current_user();

		$roles = array_map( 'strval', (array) $u->roles );

		// Only include capabilities explicitly granted (true).
		$caps = array();
		foreach ( (array) $u->allcaps as $key => $granted ) {
			if ( true === $granted ) {
				$caps[] = (string) $key;
			}
		}

		return array(
			'id'             => (int) $u->ID,
			'name'           => (string) $u->display_name,
			'email'          => (string) $u->user_email,
			'roles'          => $roles,
			'capabilities'   => $caps,
			'avatar'         => get_avatar_url( $u->ID, array( 'size' => 96 ) ),
			'is_super_admin' => function_exists( 'is_super_admin' ) ? (bool) is_super_admin( $u->ID ) : false,
		);
	}
}
