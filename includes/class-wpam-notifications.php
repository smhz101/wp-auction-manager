<?php
namespace WPAM\Includes;

class WPAM_Notifications {
    public static function send_to_user( $user_id, $subject, $message ) {
        $sms_enabled   = get_option( 'wpam_enable_twilio', '0' );
        $push_enabled  = get_option( 'wpam_enable_firebase', '0' );
        $email_enabled = get_option( 'wpam_enable_email', '1' );
        $sendgrid_key  = get_option( 'wpam_sendgrid_key', '' );

        $user  = get_user_by( 'id', $user_id );
        if ( ! $user ) {
            return;
        }

        $phone   = get_user_meta( $user_id, 'billing_phone', true );
        $token   = get_user_meta( $user_id, 'wpam_firebase_token', true );

        $sms_provider     = new WPAM_Twilio_Provider();
        $push_provider    = new WPAM_Firebase_Provider();
        $sendgrid_provider = new WPAM_SendGrid_Provider();

        $sent = false;
        if ( $push_enabled && $token ) {
            $result = $push_provider->send( $token, $message );
            $sent   = ! is_wp_error( $result );
        }

        if ( ! $sent && $sms_enabled && $phone ) {
            $result = $sms_provider->send( $phone, $message );
            $sent   = ! is_wp_error( $result );
        }

        if ( ! $sent && $email_enabled ) {
            if ( $sendgrid_key ) {
                $result = $sendgrid_provider->send( $user->user_email, $message );
                $sent   = ! is_wp_error( $result );
            }

            if ( ! $sent ) {
                wp_mail( $user->user_email, $subject, $message );
                $sent = true;
            }
        }
    }

    protected static function get_recipients( $auction_id ) {
        global $wpdb;
        $watchers = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM {$wpdb->prefix}wc_auction_watchlists WHERE auction_id = %d", $auction_id ) );
        $bidders  = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id ) );
        return array_unique( array_merge( $watchers, $bidders ) );
    }

    public static function notify_new_bid( $auction_id, $bid, $exclude_user = 0 ) {
        $title   = get_the_title( $auction_id );
        $subject = sprintf( __( 'New bid on %s', 'wpam' ), $title );
        $amount  = function_exists( 'wc_price' ) ? wc_price( $bid ) : $bid;
        $message = sprintf( __( 'A new bid of %1$s was placed on "%2$s".', 'wpam' ), $amount, $title );
        $recipients = self::get_recipients( $auction_id );
        foreach ( $recipients as $user_id ) {
            if ( $user_id == $exclude_user ) {
                continue;
            }
            self::send_to_user( $user_id, $subject, $message );
        }
    }

    public static function notify_auction_end( $auction_id ) {
        global $wpdb;
        $highest = $wpdb->get_var( $wpdb->prepare( "SELECT MAX(bid_amount) FROM {$wpdb->prefix}wc_auction_bids WHERE auction_id = %d", $auction_id ) );
        $title   = get_the_title( $auction_id );
        $subject = sprintf( __( 'Auction ended for %s', 'wpam' ), $title );
        $price   = $highest ? ( function_exists( 'wc_price' ) ? wc_price( $highest ) : $highest ) : __( 'No bids', 'wpam' );
        $message = sprintf( __( 'Auction "%1$s" has ended. Final price: %2$s', 'wpam' ), $title, $price );
        $recipients = self::get_recipients( $auction_id );
        foreach ( $recipients as $user_id ) {
            self::send_to_user( $user_id, $subject, $message );
        }
    }

    public static function notify_auction_reminder( $auction_id ) {
        global $wpdb;
        $watchers = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM {$wpdb->prefix}wc_auction_watchlists WHERE auction_id = %d", $auction_id ) );
        if ( empty( $watchers ) ) {
            return;
        }
        $title   = get_the_title( $auction_id );
        $subject = sprintf( __( 'Auction ending soon: %s', 'wpam' ), $title );
        $message = sprintf( __( 'The auction "%s" ends in less than 30 minutes. Place your bid now!', 'wpam' ), $title );
        foreach ( $watchers as $user_id ) {
            self::send_to_user( $user_id, $subject, $message );
        }
    }
}
