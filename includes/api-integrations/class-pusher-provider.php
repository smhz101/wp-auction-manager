<?php
namespace WPAM\Includes;

use Pusher\Pusher;

class WPAM_Pusher_Provider implements WPAM_Realtime_Provider {
    /** @var Pusher|null */
    protected $pusher = null;

    /** @var string */
    protected $channelPrefix = 'auction-';

    /** @var int|null */
    protected $auction_id = null;

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
     * Set the auction ID for this instance.
     *
     * @param int $auction_id
     */
    public function set_auction_id( $auction_id ) {
        $this->auction_id = absint( $auction_id );
    }

    /**
     * Get the computed channel name for the current auction.
     *
     * @return string|null
     */
    public function get_channel_name() {
        if ( ! $this->auction_id ) {
            return null;
        }
        return $this->channelPrefix . $this->auction_id;
    }

    /**
     * Check if the provider is properly configured.
     */
    public function is_active() {
        return (bool) $this->pusher;
    }

    /**
     * Send a bid update to the current auction's channel.
     *
     * @param int $auction_id
     * @param float $bid_amount
     */
    public function send_bid_update( $auction_id, $bid_amount ) {
        if ( ! $this->pusher ) {
            return;
        }

        $this->set_auction_id( $auction_id );
        $channel = $this->get_channel_name();

        if ( $channel ) {
            $this->pusher->trigger(
                $channel,
                'bid_update',
                [
                    'auction_id' => $auction_id,
                    'bid'        => $bid_amount,
                ]
            );
        }
    }
}
