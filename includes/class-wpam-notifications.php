<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Notifications {
	public static function send_to_user( $user_id, $subject, $message ) {
		$sms_enabled   = get_option( 'wpam_enable_twilio', '0' );
		$push_enabled  = get_option( 'wpam_enable_firebase', '0' );
		$email_enabled = get_option( 'wpam_enable_email', '1' );
		$sendgrid_key  = get_option( 'wpam_sendgrid_key', '' );

		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return;
		}

		$phone = get_user_meta( $user_id, 'billing_phone', true );
		$token = get_user_meta( $user_id, 'wpam_firebase_token', true );

		$sent = false;
		if ( $push_enabled && $token ) {
			$push_provider = new WPAM_Firebase_Provider();
			$result        = $push_provider->send( $token, $message );
			$sent          = ! is_wp_error( $result );
		}

		if ( ! $sent && $sms_enabled && $phone ) {
			$sms_provider = new WPAM_Twilio_Provider();
			$result       = $sms_provider->send( $phone, $message );
			$sent         = ! is_wp_error( $result );
		}

		if ( ! $sent && $email_enabled ) {
			if ( $sendgrid_key ) {
				$sendgrid_provider = new WPAM_SendGrid_Provider();
				$result            = $sendgrid_provider->send( $user->user_email, $message );
				$sent              = ! is_wp_error( $result );
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
		$title      = get_the_title( $auction_id );
		$subject    = sprintf( __( 'New bid on %s', 'wpam' ), $title );
		$amount     = function_exists( 'wc_price' ) ? wc_price( $bid ) : $bid;
		$message    = sprintf( __( 'A new bid of %1$s was placed on "%2$s".', 'wpam' ), $amount, $title );
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
		$winner  = (int) get_post_meta( $auction_id, '_auction_winner', true );

		if ( ! $winner ) {
			return;
		}

		$title   = get_the_title( $auction_id );
		$subject = sprintf( __( 'Auction ended for %s', 'wpam' ), $title );
		$price   = $highest ? ( function_exists( 'wc_price' ) ? wc_price( $highest ) : $highest ) : __( 'No bids', 'wpam' );
		$message = sprintf( __( 'Auction "%1$s" has ended. Final price: %2$s', 'wpam' ), $title, $price );

		self::send_to_user( $winner, $subject, $message );
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

	/**
	 * Notify watchers and leading bidders when an auction end time is extended.
	 *
	 * @param int $auction_id Auction ID.
	 * @param int $new_end_ts New end timestamp (UTC).
	 */
	public static function notify_auction_extended( $auction_id, $new_end_ts ) {
		global $wpdb;

		$watchers = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM {$wpdb->prefix}wc_auction_watchlists WHERE auction_id = %d", $auction_id ) );

		$table   = $wpdb->prefix . 'wc_auction_bids';
		$reverse = 'reverse' === get_post_meta( $auction_id, '_auction_type', true );
		$order   = $reverse ? 'ASC' : 'DESC';
		$lead    = $wpdb->get_var( $wpdb->prepare( "SELECT bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order}, id DESC LIMIT 1", $auction_id ) );
		$leaders = array();
		if ( null !== $lead ) {
			$leaders = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT user_id FROM $table WHERE auction_id = %d AND bid_amount = %f", $auction_id, $lead ) );
		}

		$recipients = array_unique( array_merge( $watchers, $leaders ) );
		if ( empty( $recipients ) ) {
			return;
		}

		$title    = get_the_title( $auction_id );
		$subject  = sprintf( __( 'Auction extended: %s', 'wpam' ), $title );
		$datetime = wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $new_end_ts );
		$message  = sprintf( __( 'The auction "%1$s" has been extended. New end time: %2$s', 'wpam' ), $title, $datetime );

		foreach ( $recipients as $user_id ) {
			self::send_to_user( $user_id, $subject, $message );
		}
	}

	/**
	 * Handle events dispatched from WPAM_Event_Bus.
	 *
	 * @param string $event   Event name.
	 * @param array  $payload Event payload.
	 */
	public function handle_event( $event, $payload ) {
		switch ( $event ) {
			case 'bid_placed':
				if ( isset( $payload['auction_id'], $payload['amount'], $payload['user_id'] ) ) {
					self::notify_new_bid( $payload['auction_id'], $payload['amount'], $payload['user_id'] );
				}
				break;
			case 'user_outbid':
				if ( isset( $payload['user_id'], $payload['auction_id'] ) && get_option( 'wpam_lead_sms_alerts' ) ) {
					$subject = sprintf( __( 'Outbid on %s', 'wpam' ), get_the_title( $payload['auction_id'] ) );
					$msg     = sprintf( __( 'You have been outbid on "%s".', 'wpam' ), get_the_title( $payload['auction_id'] ) );
					self::send_to_user( $payload['user_id'], $subject, $msg );
				}
				break;
			case 'max_exceeded':
				if ( isset( $payload['user_id'], $payload['auction_id'] ) && get_option( 'wpam_lead_sms_alerts' ) ) {
					$subject = sprintf( __( 'Max bid exceeded for %s', 'wpam' ), get_the_title( $payload['auction_id'] ) );
					$msg     = sprintf( __( 'Your maximum bid for "%s" has been exceeded.', 'wpam' ), get_the_title( $payload['auction_id'] ) );
					self::send_to_user( $payload['user_id'], $subject, $msg );
				}
				break;
			case 'auction_extended':
				if ( isset( $payload['auction_id'], $payload['new_end_ts'] ) ) {
					self::notify_auction_extended( $payload['auction_id'], $payload['new_end_ts'] );
				}
				break;
		}
	}
}
