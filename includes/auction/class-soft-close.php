<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Soft_Close {
	/**
	 * Maybe extend an auction's end time based on soft close settings.
	 *
	 * @param int $auction_id Auction ID.
	 * @param int $end_ts     Current end timestamp.
	 * @param int $now        Current timestamp.
	 * @return array          { 'extended' => bool, 'new_end_ts' => int }
	 */
	public static function maybe_extend_end( $auction_id, $end_ts, $now ) {
		$extended   = false;
		$new_end_ts = $end_ts;

		$threshold = absint( get_option( 'wpam_soft_close_threshold', 0 ) );
		$extension = absint( get_option( 'wpam_soft_close_extend', 0 ) );

		$extension_count = (int) get_post_meta( $auction_id, '_auction_extension_count', true );
		$max_extensions  = absint( get_option( 'wpam_max_extensions', 0 ) );

		if ( $threshold > 0 && $end_ts - $now <= $threshold ) {
			if ( 0 === $max_extensions || $extension_count < $max_extensions ) {
				$new_end_ts = $end_ts + $extension;
				$new_end    = wp_date( 'Y-m-d H:i:s', $new_end_ts, new \DateTimeZone( 'UTC' ) );
				update_post_meta( $auction_id, '_auction_end', $new_end );
				update_post_meta( $auction_id, '_auction_extension_count', $extension_count + 1 );
				wp_clear_scheduled_hook( 'wpam_auction_end', array( $auction_id ) );
				wp_schedule_single_event( $new_end_ts, 'wpam_auction_end', array( $auction_id ) );
				$extended = true;
				do_action( 'wpam_soft_close_extended', $auction_id, $new_end_ts );
			}
		}

		return array(
			'extended'   => $extended,
			'new_end_ts' => $new_end_ts,
		);
	}
}
