<?php
namespace WPAM\Includes\Bidding;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface BidStrategyInterface {
	public function place_bid( int $auction_id, int $user_id, float $bid, float $max_bid );
}
