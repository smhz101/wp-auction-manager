<?php
namespace WPAM\Includes;

interface WPAM_Realtime_Provider {
    public function send_bid_update( $auction_id, $bid_amount );
    public function send_viewer_event( $auction_id, $action );
}
