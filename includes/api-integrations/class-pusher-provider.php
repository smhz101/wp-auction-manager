<?php
namespace WPAM\Includes;

use Pusher\Pusher;

class WPAM_Pusher_Provider implements WPAM_Realtime_Provider {
    /** @var Pusher|null */
    protected $pusher = null;

    /** @var string */
    protected $channel = 'wpam-auctions';

    public function __construct() {
        $provider = get_option( 'wpam_realtime_provider', 'none' );
        $app_id   = get_option( 'wpam_pusher_app_id' );
        $key      = get_option( 'wpam_pusher_key' );
        $secret   = get_option( 'wpam_pusher_secret' );
        $cluster  = get_option( 'wpam_pusher_cluster' );

        if ( 'pusher' === $provider && $app_id && $key && $secret && $cluster ) {
            $this->pusher = new Pusher(
                $key,
                $secret,
                $app_id,
                [
                    'cluster' => $cluster,
                    'useTLS'  => true,
                ]
            );
        }
    }

    /**
     * Check if the provider is properly configured.
     */
    public function is_active() {
        return (bool) $this->pusher;
    }

    public function send_bid_update( $auction_id, $bid_amount ) {
        if ( ! $this->pusher ) {
            return;
        }

        $this->pusher->trigger(
            $this->channel,
            'bid_update',
            [
                'auction_id' => $auction_id,
                'bid'        => $bid_amount,
            ]
        );
    }
}
