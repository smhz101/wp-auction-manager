<?php
namespace WPAM\Includes\Bidding;

interface BidStrategyInterface {
    public function place_bid( int $auction_id, int $user_id, float $bid, float $max_bid );
}
