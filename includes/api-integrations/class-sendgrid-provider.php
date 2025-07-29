<?php
namespace WPAM\Includes;

class WPAM_SendGrid_Provider implements WPAM_API_Provider {
    public function send( $to, $message ) {
        $key = get_option( 'wpam_sendgrid_key' );
        if ( ! $key ) {
            return new \WP_Error( 'sendgrid_credentials', __( 'SendGrid API key missing', 'wpam' ) );
        }
        $body = [
            'personalizations' => [ [ 'to' => [ [ 'email' => $to ] ] ] ],
            'from'            => [ 'email' => get_option( 'admin_email' ) ],
            'subject'         => __( 'Auction Notification', 'wpam' ),
            'content'         => [ [ 'type' => 'text/plain', 'value' => $message ] ],
        ];
        $response = wp_remote_post( 'https://api.sendgrid.com/v3/mail/send', [
            'body'    => wp_json_encode( $body ),
            'headers' => [
                'Authorization' => 'Bearer ' . $key,
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
        return new \WP_Error( 'sendgrid_http', wp_remote_retrieve_body( $response ) );
    }
}
