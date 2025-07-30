<?php
namespace WPAM\Includes;

/**
 * Send webhook calls on key auction events.
 */
class WPAM_Webhooks {
    public function __construct() {
        add_action( 'wpam_auction_end', [ $this, 'send_auction_end' ], 20, 1 );
    }

    /**
     * Triggered when an auction ends.
     *
     * @param int $auction_id Auction post ID.
     */
    public function send_auction_end( $auction_id ) {
        $url = trim( get_option( 'wpam_webhook_url', '' ) );
        if ( empty( $url ) ) {
            return;
        }

        $payload = [
            'event'      => 'auction_end',
            'auction_id' => $auction_id,
        ];

        wp_remote_post(
            $url,
            [
                'body'    => wp_json_encode( $payload ),
                'headers' => [ 'Content-Type' => 'application/json' ],
                'timeout' => 5,
            ]
        );
    }
}
