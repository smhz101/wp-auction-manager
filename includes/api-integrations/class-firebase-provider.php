<?php
class WPAM_Firebase_Provider implements WPAM_API_Provider {
    /**
     * Send a push notification via Firebase Cloud Messaging.
     *
     * @param string $token   Device token to send to.
     * @param string $message Notification message.
     * @return true|WP_Error
     */
    public function send( $token, $message ) {
        $key = get_option( 'wpam_firebase_server_key' );
        if ( ! $key || ! $token ) {
            return new WP_Error( 'firebase_credentials', __( 'Firebase not configured', 'wpam' ) );
        }

        $body = [
            'to'   => $token,
            'notification' => [
                'title' => __( 'Auction Update', 'wpam' ),
                'body'  => $message,
            ],
        ];

        $response = wp_remote_post( 'https://fcm.googleapis.com/fcm/send', [
            'body'    => wp_json_encode( $body ),
            'headers' => [
                'Authorization' => 'key=' . $key,
                'Content-Type'  => 'application/json',
            ],
            'timeout' => 15,
        ] );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code( $response );
        if ( $code >= 200 && $code < 300 ) {
            return true;
        }

        return new WP_Error( 'firebase_http', wp_remote_retrieve_body( $response ) );
    }
}
