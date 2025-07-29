<?php
class WPAM_Twilio_Provider implements WPAM_API_Provider {
    public function send( $to, $message ) {
        $sid   = get_option( 'wpam_twilio_sid' );
        $token = get_option( 'wpam_twilio_token' );
        $from  = get_option( 'wpam_twilio_from' );

        if ( ! $sid || ! $token || ! $from ) {
            return new WP_Error( 'twilio_credentials', __( 'Twilio credentials not configured', 'wpam' ) );
        }

        $endpoint = sprintf( 'https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json', rawurlencode( $sid ) );

        $response = wp_remote_post( $endpoint, [
            'body'    => [
                'To'   => $to,
                'From' => $from,
                'Body' => $message,
            ],
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode( $sid . ':' . $token ),
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

        return new WP_Error( 'twilio_http', wp_remote_retrieve_body( $response ) );
    }
}
