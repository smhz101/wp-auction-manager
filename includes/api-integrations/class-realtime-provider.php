<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface WPAM_Realtime_Provider {
	public function send_bid_update( $auction_id, $bid_amount, $statuses = array() );
	public function send_viewer_event( $auction_id, $action );
	public function trigger_bid_placed( $auction_id, $user_id, $amount, $statuses = array() );
	public function trigger_user_outbid( $auction_id, $user_id );
	public function trigger_auction_status( $auction_id, $status, $reason = '' );
}
