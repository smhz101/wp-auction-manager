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

    /**
     * Return underlying Pusher client instance.
     *
     * @return Pusher|null
     */
    public function get_client() {
        return $this->pusher;
    }

    /**
     * Return participant count (unique bidders + watchers).
     *
     * @param int $auction_id
     * @return int
     */
    protected function get_participant_count( $auction_id ) {
        global $wpdb;
        $bidders  = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id ) );
        $watchers = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM {$wpdb->prefix}wc_auction_watchlists WHERE auction_id = %d", $auction_id ) );
        return count( array_unique( array_merge( $bidders, $watchers ) ) );
    }

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
            $lead_user    = intval( get_post_meta( $auction_id, '_auction_lead_user', true ) );
            $participants = $this->get_participant_count( $auction_id );

            $this->pusher->trigger(
                $channel,
                'bid_update',
                [
                    'auction_id'  => $auction_id,
                    'bid'         => $bid_amount,
                    'lead_user'   => $lead_user,
                    'participants' => $participants,
                ]
            );
        }
    }

    /**
     * Publish viewer join/leave events with current counts.
     *
     * @param int    $auction_id
     * @param string $action     join|leave
     */
    public function send_viewer_event( $auction_id, $action = 'join' ) {
        if ( ! $this->pusher ) {
            return;
        }

        $this->set_auction_id( $auction_id );
        $channel = $this->get_channel_name();

        if ( $channel ) {
            $key     = 'wpam_viewers_' . $auction_id;
            $count   = intval( get_transient( $key ) );
            if ( 'join' === $action ) {
                $count++;
            } else {
                $count = max( 0, $count - 1 );
            }
            set_transient( $key, $count, 2 * HOUR_IN_SECONDS );

            $this->pusher->trigger(
                $channel,
                'viewer_update',
                [
                    'auction_id'   => $auction_id,
                    'viewers'      => $count,
                    'participants' => $this->get_participant_count( $auction_id ),
                    'action'       => $action,
                ]
            );
        }
    }

    /**
     * Handle events dispatched from WPAM_Event_Bus.
     *
     * @param string $event   Event name.
     * @param array  $payload Event payload.
     */
    public function handle_event( $event, $payload ) {
        if ( ! $this->pusher ) {
            return;
        }

        switch ( $event ) {
            case 'bid_placed':
                if ( isset( $payload['auction_id'], $payload['amount'] ) ) {
                    $this->send_bid_update( $payload['auction_id'], $payload['amount'] );
                }
                break;
            case 'auction_extended':
                if ( isset( $payload['auction_id'], $payload['new_end_ts'] ) ) {
                    $this->set_auction_id( $payload['auction_id'] );
                    $channel = $this->get_channel_name();
                    if ( $channel ) {
                        $this->pusher->trigger(
                            $channel,
                            'auction_extended',
                            [
                                'auction_id' => $payload['auction_id'],
                                'new_end_ts' => $payload['new_end_ts'],
                            ]
                        );
                    }
                }
                break;
            case 'user_outbid':
                // no realtime action for single user; handled via notifications.
                break;
        }
    }
}
