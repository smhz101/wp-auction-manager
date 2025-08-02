<?php
namespace WPAM\Includes;

use WPAM\Includes\WPAM_Admin_Log;
use WPAM\Includes\WPAM_Event_Bus;

if ( class_exists( 'WC_Product' ) && ! class_exists( 'WC_Product_Auction' ) ) {
	class WC_Product_Auction extends \WC_Product {
		public function get_type() {
			return 'auction';
		}
	}
}

class WPAM_Auction {
        const ABOUT_TO_START_THRESHOLD = HOUR_IN_SECONDS;
        const REMINDER_THRESHOLD       = 30 * MINUTE_IN_SECONDS;
	public function __construct() {
		add_action( 'init', array( $this, 'register_product_type' ) );
		add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_product_data_tab' ) );
		add_filter( 'woocommerce_product_data_tabs', array( $this, 'reorder_product_tabs' ), 20 );
		add_action( 'woocommerce_product_data_panels', array( $this, 'add_product_data_fields' ) );
                add_action( 'woocommerce_process_product_meta_auction', array( $this, 'save_product_data' ) );
                add_action( 'init', array( $this, 'schedule_cron' ) );
                add_action( 'init', array( $this, 'register_meta_fields' ) );
                add_action( 'wpam_check_ended_auctions', array( $this, 'check_ended_auctions' ) );
                add_action( 'wpam_update_auction_states', array( $this, 'update_auction_states' ) );
                add_action( 'wpam_auction_start', array( $this, 'handle_auction_start' ) );
                add_action( 'wpam_auction_end', array( $this, 'handle_auction_end' ) );
               add_action( 'wpam_send_auction_reminders', array( $this, 'send_auction_reminders' ) );
               add_filter( 'cron_schedules', array( $this, 'register_cron_schedules' ) );
               if ( defined( 'WP_CLI' ) && WP_CLI ) {
                       \WP_CLI::add_command( 'wpam auction-status', array( $this, 'cli_auction_status' ) );
               }
       }

	public function register_meta_fields() {
               register_post_meta(
                       'product',
                       '_auction_state',
                       array(
                               'show_in_rest'       => true,
                               'single'             => true,
                               'type'               => 'string',
                               'auth_callback'      => function ( $allowed, $meta_key, $post_id ) {
                                       return current_user_can( 'edit_product', $post_id );
                               },
                               'sanitize_callback' => 'sanitize_text_field',
                       )
               );

               register_post_meta(
                       'product',
                       '_auction_status',
                       array(
                               'show_in_rest'       => true,
                               'single'             => true,
                               'type'               => 'string',
                               'auth_callback'      => function ( $allowed, $meta_key, $post_id ) {
                                       return current_user_can( 'edit_product', $post_id );
                               },
                               'sanitize_callback' => 'sanitize_text_field',
                       )
               );

               register_post_meta(
                       'product',
                       '_auction_ending_reason',
                       array(
                               'show_in_rest'       => true,
                               'single'             => true,
                               'type'               => 'string',
                               'auth_callback'      => function ( $allowed, $meta_key, $post_id ) {
                                       return current_user_can( 'edit_product', $post_id );
                               },
                               'sanitize_callback' => 'sanitize_text_field',
                       )
               );
	}

	public function register_product_type() {
		add_filter( 'product_type_selector', array( $this, 'add_product_type' ) );
		add_filter( 'woocommerce_product_class', array( $this, 'register_auction_class' ), 10, 2 );
	}

	public function add_product_type( $types ) {
		$types['auction'] = __( 'Auction product', 'wpam' );
		return $types;
	}

	public function register_auction_class( $classname, $product_type ) {
		if ( $product_type === 'auction' ) {
				return WC_Product_Auction::class;
		}
		return $classname;
	}

	public function add_product_data_tab( $tabs ) {
		$tabs['auction'] = array(
			'label'  => __( 'Auction', 'wpam' ),
			'target' => 'auction_product_data',
			'class'  => array( 'show_if_auction', 'auction_tab' ),
		);
		return $tabs;
	}

	public function reorder_product_tabs( $tabs ) {
		if ( isset( $tabs['auction'] ) ) {
			$auction_tab = $tabs['auction'];
			unset( $tabs['auction'] );
			foreach ( $tabs as $key => $tab ) {
				if ( ! isset( $tabs[ $key ]['class'] ) ) {
					$tabs[ $key ]['class'] = array();
				}
				$tabs[ $key ]['class'][] = 'hide_if_auction';
			}
			$tabs = array_merge( array( 'auction' => $auction_tab ), $tabs );
		}
		return $tabs;
	}

	public function add_product_data_fields() {
               global $post;
               $post_id = $post ? $post->ID : 0;
               echo '<div id="auction_product_data" class="panel woocommerce_options_panel hidden show_if_auction">';
               wp_nonce_field( 'wpam_save_product_data', 'wpam_product_nonce' );

               woocommerce_wp_select(
			array(
				'id'          => '_auction_type',
				'label'       => __( 'Auction Type', 'wpam' ),
				'description' => __( 'Select the bidding style for this auction.', 'wpam' ),
				'desc_tip'    => true,
				'options'     => array(
					'standard' => __( 'Standard', 'wpam' ),
					'reverse'  => __( 'Reverse', 'wpam' ),
					'sealed'   => __( 'Sealed', 'wpam' ),
				),
				'value'       => get_post_meta( $post_id, '_auction_type', true ),
			)
		);

		$timezone    = wp_timezone();
		$current_ts  = current_datetime()->getTimestamp();
		$start_value = get_post_meta( $post_id, '_auction_start', true );

		if ( ! $start_value ) {
			$start_value = wp_date( 'Y-m-d H:i:s', $current_ts + HOUR_IN_SECONDS, $timezone );
		}

		$start_timestamp = ( new \DateTimeImmutable( $start_value, $timezone ) )->getTimestamp();
		$is_past_start   = $start_timestamp < $current_ts;

		$end_value = get_post_meta( $post_id, '_auction_end', true );
		if ( ! $end_value ) {
			$end_value = wp_date( 'Y-m-d H:i:s', $start_timestamp + DAY_IN_SECONDS, $timezone );
		}

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_start',
				'label'             => __( 'Start Date', 'wpam' ),
				'type'              => 'datetime-local',
				'description'       => __( 'When bidding opens.', 'wpam' ),
				'desc_tip'          => true,
				'value'             => $start_value,
				'custom_attributes' => $is_past_start ? array( 'disabled' => 'disabled' ) : array(),
			)
		);

		if ( $is_past_start ) {
			echo '<input type="hidden" name="_auction_start" value="' . esc_attr( $start_value ) . '" />';
		}

		woocommerce_wp_text_input(
			array(
				'id'          => '_auction_end',
				'label'       => __( 'End Date', 'wpam' ),
				'type'        => 'datetime-local',
				'description' => __( 'When the auction will close.', 'wpam' ),
				'desc_tip'    => true,
				'value'       => $end_value,
			)
		);

                woocommerce_wp_text_input(
                        array(
                                'id'                => '_auction_reserve',
                                'label'             => __( 'Reserve Price', 'wpam' ),
                                'description'       => __( 'Minimum price required for a valid sale.', 'wpam' ),
                                'desc_tip'          => true,
                                'type'              => 'number',
                                'custom_attributes' => array(
                                        'step' => '0.01',
                                        'min'  => '0',
                                ),
                                'value'             => get_post_meta( $post_id, '_auction_reserve', true ),
                        )
                );

                woocommerce_wp_checkbox(
                        array(
                                'id'          => '_auction_enable_buy_now',
                                'label'       => __( 'Enable Buy Now', 'wpam' ),
                                'description' => __( 'Allow instant purchase for this auction.', 'wpam' ),
                                'desc_tip'    => true,
                                'value'       => get_post_meta( $post_id, '_auction_enable_buy_now', true ),
                        )
                );

                woocommerce_wp_text_input(
                        array(
                                'id'                => '_auction_buy_now',
                                'label'             => __( 'Buy Now Price', 'wpam' ),
                                'description'       => __( 'Optional instant purchase amount.', 'wpam' ),
				'desc_tip'          => true,
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '0.01',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_buy_now', true ),
			)
		);

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_increment',
				'label'             => __( 'Minimum Increment', 'wpam' ),
				'description'       => __( 'Lowest amount a new bid must increase by.', 'wpam' ),
				'desc_tip'          => true,
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '0.01',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_increment', true ),
			)
		);

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_soft_close',
				'label'             => __( 'Soft Close Minutes', 'wpam' ),
				'description'       => __( 'Number of minutes to extend if a bid is placed near the end.', 'wpam' ),
				'desc_tip'          => true,
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '1',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_soft_close', true ),
			)
		);

		woocommerce_wp_checkbox(
			array(
				'id'          => '_auction_auto_relist',
				'label'       => __( 'Auto Relist', 'wpam' ),
				'description' => __( 'Relist automatically when there is no winner.', 'wpam' ),
				'desc_tip'    => true,
				'value'       => get_post_meta( $post_id, '_auction_auto_relist', true ),
			)
		);

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_max_bids',
				'label'             => __( 'Max Bids Per User', 'wpam' ),
				'description'       => __( 'Limit how many bids each user may place.', 'wpam' ),
				'desc_tip'          => true,
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '1',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_max_bids', true ),
			)
		);

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_fee',
				'label'             => __( 'Auction Fee', 'wpam' ),
				'description'       => __( 'Extra fee added to the winning bid.', 'wpam' ),
				'desc_tip'          => true,
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '0.01',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_fee', true ),
			)
		);

		woocommerce_wp_select(
			array(
				'id'      => '_product_condition',
				'label'   => __( 'Product Condition', 'wpam' ),
				'options' => array(
					'new'         => __( 'New', 'wpam' ),
					'used'        => __( 'Used', 'wpam' ),
					'refurbished' => __( 'Refurbished', 'wpam' ),
					'other'       => __( 'Other', 'wpam' ),
				),
				'value'   => get_post_meta( $post_id, '_product_condition', true ),
			)
		);

		woocommerce_wp_text_input(
			array(
				'id'          => '_sku',
				'label'       => __( 'SKU', 'wpam' ),
				'desc_tip'    => true,
				'description' => __( 'Stock keeping unit.', 'wpam' ),
				'value'       => get_post_meta( $post_id, '_sku', true ),
			)
		);

		if ( get_option( 'wpam_enable_proxy_bidding' ) ) {
			woocommerce_wp_checkbox(
				array(
					'id'    => '_auction_proxy_bidding',
					'label' => __( 'Enable Proxy Bidding', 'wpam' ),
					'value' => get_post_meta( $post_id, '_auction_proxy_bidding', true ),
				)
			);
		}

		if ( get_option( 'wpam_enable_silent_bidding' ) ) {
			woocommerce_wp_checkbox(
				array(
					'id'    => '_auction_silent_bidding',
					'label' => __( 'Enable Silent Bidding', 'wpam' ),
					'value' => get_post_meta( $post_id, '_auction_silent_bidding', true ),
				)
			);
		}

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_opening_price',
				'label'             => __( 'Opening Price', 'wpam' ),
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '0.01',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_opening_price', true ),
			)
		);

		woocommerce_wp_text_input(
			array(
				'id'                => '_auction_lowest_price',
				'label'             => __( 'Lowest Price', 'wpam' ),
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '0.01',
					'min'  => '0',
				),
				'value'             => get_post_meta( $post_id, '_auction_lowest_price', true ),
			)
		);

		woocommerce_wp_checkbox(
			array(
				'id'    => '_auction_variable_increment',
				'label' => __( 'Use Variable Bid Increment', 'wpam' ),
				'value' => get_post_meta( $post_id, '_auction_variable_increment', true ),
			)
		);

		echo '<div class="show_if_variable_increment">';
		woocommerce_wp_textarea_input(
			array(
				'id'          => '_auction_variable_increment_rules',
				'label'       => __( 'Increment Rules', 'wpam' ),
				'description' => __( 'One "max|increment" pair per line.', 'wpam' ),
				'value'       => get_post_meta( $post_id, '_auction_variable_increment_rules', true ),
			)
		);
		echo '</div>';

		$timezone     = wp_timezone();
		$timestamp    = time();
		$offset_hours = $timezone->getOffset( new \DateTimeImmutable( '@' . $timestamp ) ) / HOUR_IN_SECONDS;
		echo '<div class="notice notice-info wpam-time-notice">';
		echo '<p>' . sprintf(
			esc_html__( 'Current time: %1$s (%2$s, UTC%3$s)', 'wpam' ),
			esc_html( wp_date( 'Y-m-d H:i:s', $timestamp, $timezone ) ),
			esc_html( $timezone->getName() ),
			esc_html( sprintf( '%+d', $offset_hours ) )
		) . '</p>';
		echo '</div>';

		echo '</div>';
	}

       public function save_product_data( $post_id ) {

               if ( ! isset( $_POST['wpam_product_nonce'] ) ) {
                       return;
               }

               $nonce = sanitize_text_field( wp_unslash( $_POST['wpam_product_nonce'] ) );

               if ( ! wp_verify_nonce( $nonce, 'wpam_save_product_data' ) ) {
                       return;
               }

               if ( ! current_user_can( 'edit_post', $post_id ) ) {
                       return;
               }

               if ( ! current_user_can( 'auction_seller' ) ) {
                       wp_die( esc_html__( 'You are not allowed to create auctions.', 'wpam' ) );
               }

               // Force product type to auction
		if ( isset( $_POST['product-type'] ) && $_POST['product-type'] === 'auction' ) {
			wp_set_object_terms( $post_id, 'auction', 'product_type', false );
			update_post_meta( $post_id, '_product_type', 'auction' );
		}

		$start = null;
		$end   = null;

		if ( isset( $_POST['_auction_start'] ) ) {
			$start = wc_clean( wp_unslash( $_POST['_auction_start'] ) );
			update_post_meta( $post_id, '_auction_start', $start );
		} else {
			$start = get_post_meta( $post_id, '_auction_start', true );
		}

                if ( isset( $_POST['_auction_end'] ) ) {

                        $end = wc_clean( $_POST['_auction_end'] );
                        update_post_meta( $post_id, '_auction_end', $end );

                        $timestamp = strtotime( $end );
                        if ( $timestamp && $timestamp > time() ) {
                                wp_clear_scheduled_hook( 'wpam_auction_end', array( $post_id ) );
                                wp_schedule_single_event( $timestamp, 'wpam_auction_end', array( $post_id ) );
                        }
                        delete_post_meta( $post_id, '_auction_reminder_sent' );
                }

                $meta_keys = array(
                        '_auction_type',
                        '_auction_reserve',
                        '_auction_enable_buy_now',
                        '_auction_buy_now',
                        '_auction_increment',
                        '_auction_soft_close',
			'_auction_auto_relist',
			'_auction_max_bids',
			'_auction_fee',
			'_product_condition',
			'_sku',
			'_auction_proxy_bidding',
			'_auction_silent_bidding',
			'_auction_opening_price',
			'_auction_lowest_price',
			'_auction_variable_increment',
                        '_auction_variable_increment_rules',
                );

                $old_opening_price = get_post_meta( $post_id, '_auction_opening_price', true );

                foreach ( $meta_keys as $key ) {
                        if ( isset( $_POST[ $key ] ) ) {
                                update_post_meta( $post_id, $key, wc_clean( wp_unslash( $_POST[ $key ] ) ) );
                        }
                }

                if ( isset( $_POST['_auction_opening_price'] ) ) {
                        $new_opening_price = wc_clean( wp_unslash( $_POST['_auction_opening_price'] ) );
                        if ( $new_opening_price !== $old_opening_price ) {
                                WPAM_Admin_Log::log_price_edit( $post_id, $old_opening_price, $new_opening_price );
                        }
                }

		$state = $this->determine_state( $post_id );
		update_post_meta( $post_id, '_auction_state', $state );
	}
       public function handle_auction_start( $auction_id ) {
               do_action( 'wpam_before_auction_start', $auction_id );
               update_post_meta( $auction_id, '_auction_status', 'live' );
               update_post_meta( $auction_id, '_auction_state', WPAM_Auction_State::LIVE );
               WPAM_Event_Bus::dispatch( 'auction_status', [
                       'auction_id' => $auction_id,
                       'status'     => 'started',
               ] );
       }

	public function handle_auction_end( $auction_id ) {
		global $wpdb;

                $table   = $wpdb->prefix . 'wc_auction_bids';
                $reverse = get_post_meta( $auction_id, '_auction_type', true ) === 'reverse';
                $order   = $reverse ? 'ASC' : 'DESC';
                $highest = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount {$order} LIMIT 1", $auction_id ), ARRAY_A );

		$ending_reason = '';

		if ( ! $highest ) {
			$ending_reason = 'no_bids';
                       if ( get_post_meta( $auction_id, '_auction_auto_relist', true ) ) {
                               $timezone = wp_timezone();
                               $duration = strtotime( get_post_meta( $auction_id, '_auction_end', true ) ) - strtotime( get_post_meta( $auction_id, '_auction_start', true ) );
                               $start    = wp_date( 'Y-m-d H:i:s', null, $timezone );
                               $end      = wp_date( 'Y-m-d H:i:s', current_datetime()->getTimestamp() + $duration, $timezone );
                               update_post_meta( $auction_id, '_auction_start', $start );
                               update_post_meta( $auction_id, '_auction_end', $end );
                               update_post_meta( $auction_id, '_auction_status', 'scheduled' );
                               update_post_meta( $auction_id, '_auction_state', WPAM_Auction_State::SCHEDULED );
                               delete_post_meta( $auction_id, '_auction_ended' );
                               delete_post_meta( $auction_id, '_auction_reminder_sent' );
                               if ( function_exists( 'as_schedule_single_action' ) ) {
                                       as_schedule_single_action( time(), 'wpam_auction_start', array( $auction_id ) );
                                       as_schedule_single_action( (int) get_gmt_from_date( $end, 'U' ), 'wpam_auction_end', array( $auction_id ) );
                               }
                               WPAM_Admin_Log::log_relist( $auction_id );
                               return;
                       }
                       update_post_meta( $auction_id, '_auction_state', WPAM_Auction_State::FAILED );
                       update_post_meta( $auction_id, '_auction_status', 'failed' );
                       update_post_meta( $auction_id, '_auction_ending_reason', $ending_reason );
                       WPAM_Admin_Log::log_end( $auction_id, $ending_reason );
                       WPAM_Event_Bus::dispatch( 'auction_status', [
                               'auction_id' => $auction_id,
                               'status'     => 'failed',
                               'reason'     => $ending_reason,
                       ] );
                       return;
               }

               $user_id = intval( $highest['user_id'] );
               $amount  = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $highest['bid_amount'] ) : (float) $highest['bid_amount'];

               $reserve = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( get_post_meta( $auction_id, '_auction_reserve', 0 ) ) : (float) get_post_meta( $auction_id, '_auction_reserve', 0 );
		if ( $reserve && $amount < $reserve ) {
			$ending_reason = 'reserve_not_met';
                       if ( get_post_meta( $auction_id, '_auction_auto_relist', true ) ) {
                               $timezone = wp_timezone();
                               $duration = strtotime( get_post_meta( $auction_id, '_auction_end', true ) ) - strtotime( get_post_meta( $auction_id, '_auction_start', true ) );
                               $start    = wp_date( 'Y-m-d H:i:s', null, $timezone );
                               $end      = wp_date( 'Y-m-d H:i:s', current_datetime()->getTimestamp() + $duration, $timezone );
                               update_post_meta( $auction_id, '_auction_start', $start );
                               update_post_meta( $auction_id, '_auction_end', $end );
                               update_post_meta( $auction_id, '_auction_status', 'scheduled' );
                               update_post_meta( $auction_id, '_auction_state', WPAM_Auction_State::SCHEDULED );
                               delete_post_meta( $auction_id, '_auction_ended' );
                               delete_post_meta( $auction_id, '_auction_reminder_sent' );
                               if ( function_exists( 'as_schedule_single_action' ) ) {
                                       as_schedule_single_action( time(), 'wpam_auction_start', array( $auction_id ) );
                                       as_schedule_single_action( (int) get_gmt_from_date( $end, 'U' ), 'wpam_auction_end', array( $auction_id ) );
                               }
                               WPAM_Admin_Log::log_relist( $auction_id );
                               return;
                       }
                       update_post_meta( $auction_id, '_auction_state', WPAM_Auction_State::FAILED );
                       update_post_meta( $auction_id, '_auction_status', 'failed' );
                       update_post_meta( $auction_id, '_auction_ending_reason', $ending_reason );
                       WPAM_Admin_Log::log_reserve_not_met( $auction_id );
                       WPAM_Admin_Log::log_end( $auction_id, $ending_reason );
                       WPAM_Event_Bus::dispatch( 'auction_status', [
                               'auction_id' => $auction_id,
                               'status'     => 'failed',
                               'reason'     => $ending_reason,
                       ] );
                       return;
               }

		$ending_reason = 'sold';

		$order = wc_create_order( array( 'customer_id' => $user_id ) );
		$order->add_product(
			wc_get_product( $auction_id ),
			1,
			array(
				'subtotal' => $amount,
				'total'    => $amount,
			)
		);

               $fee = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( get_post_meta( $auction_id, '_auction_fee', 0 ) ) : (float) get_post_meta( $auction_id, '_auction_fee', 0 );
		$fee = apply_filters( 'wpam_auction_fee_calculated', $fee, $auction_id, $amount );
		if ( $fee > 0 ) {
			$item = new \WC_Order_Item_Fee();
			$item->set_name( __( 'Auction Fee', 'wpam' ) );
			$item->set_amount( $fee );
			$item->set_total( $fee );
			$order->add_item( $item );
		}

		$order->calculate_totals();
		$order->save();

		update_post_meta( $auction_id, '_auction_winner', $user_id );
		update_post_meta( $auction_id, '_auction_order_id', $order->get_id() );
		update_post_meta( $auction_id, '_auction_sold', '1' );
		update_post_meta( $auction_id, '_stock_status', 'outofstock' );

		$user    = get_user_by( 'id', $user_id );
		$subject = sprintf( __( 'You won the auction: %s', 'wpam' ), get_the_title( $auction_id ) );
		$message = sprintf( __( 'Congratulations! You won with a bid of %1$s. Order #%2$d has been created.', 'wpam' ), wc_price( $amount ), $order->get_id() );
		wp_mail( $user->user_email, $subject, $message );

		$sid   = get_option( 'wpam_twilio_sid' );
		$token = get_option( 'wpam_twilio_token' );
		$from  = get_option( 'wpam_twilio_from' );
		$phone = get_user_meta( $user_id, 'billing_phone', true );

		if ( $sid && $token && $from && $phone && class_exists( 'WPAM_Twilio_Provider' ) ) {
			$twilio  = new WPAM_Twilio_Provider();
			$sms_msg = sprintf( __( 'You won auction %1$s for %2$s', 'wpam' ), get_the_title( $auction_id ), wc_price( $amount ) );
			$twilio->send( $phone, $sms_msg );
		}

               update_post_meta( $auction_id, '_auction_state', WPAM_Auction_State::COMPLETED );
               update_post_meta( $auction_id, '_auction_status', 'completed' );
               update_post_meta( $auction_id, '_auction_ending_reason', $ending_reason );
               WPAM_Admin_Log::log_end( $auction_id, $ending_reason );
               WPAM_Event_Bus::dispatch( 'auction_status', [
                       'auction_id' => $auction_id,
                       'status'     => 'completed',
                       'reason'     => $ending_reason,
               ] );
               
               do_action( 'wpam_after_auction_end', $auction_id, $user_id, $amount );
       }

       public function schedule_cron() {
               if ( ! function_exists( 'as_schedule_single_action' ) ) {
                       return;
               }

               $args  = array(
                       'post_type'   => 'product',
                       'post_status' => 'publish',
                       'meta_query'  => array(
                               array(
                                       'key'     => '_auction_start',
                                       'compare' => 'EXISTS',
                               ),
                       ),
               );

               $query = new \WP_Query( $args );

               foreach ( $query->posts as $post ) {
                       $start = strtotime( get_post_meta( $post->ID, '_auction_start', true ) );
                       if ( $start && ! as_has_scheduled_action( 'wpam_auction_start', array( $post->ID ) ) ) {
                               as_schedule_single_action( $start, 'wpam_auction_start', array( $post->ID ) );
                       }

                       $end = strtotime( get_post_meta( $post->ID, '_auction_end', true ) );
                       if ( $end && ! as_has_scheduled_action( 'wpam_auction_end', array( $post->ID ) ) ) {
                               as_schedule_single_action( $end, 'wpam_auction_end', array( $post->ID ) );
                       }
               }
       }

        public function check_ended_auctions() {
                $args = array(
                        'post_type'   => 'product',
                        'post_status' => 'publish',
                        'meta_query'  => array(
                                array(
                                        'key'     => '_auction_end',
                                        'value'   => wp_date( 'Y-m-d H:i:s', null, wp_timezone() ),
                                        'compare' => '<=',
                                        'type'    => 'DATETIME',
                                ),
                                array(
                                        'key'     => '_auction_ended',
                                        'compare' => 'NOT EXISTS',
                                ),
                        ),
                );

                $paged = 1;
                do {
                        $query = new \WP_Query(
                                array_merge(
                                        $args,
                                        array(
                                                'posts_per_page' => 50,
                                                'paged'          => $paged,
                                        )
                                )
                        );

                        foreach ( $query->posts as $post ) {
                                update_post_meta( $post->ID, '_auction_ended', 1 );
                                update_post_meta( $post->ID, '_auction_state', WPAM_Auction_State::ENDED );
                                WPAM_Notifications::notify_auction_end( $post->ID );
                        }

                        wp_reset_postdata();
                        $paged++;
                } while ( $query->have_posts() );
        }

       protected function determine_state( $auction_id ) {
               $status = get_post_meta( $auction_id, '_auction_status', true );
               if ( 'canceled' === $status ) {
                       return WPAM_Auction_State::CANCELED;
               }
               if ( 'suspended' === $status ) {
                       return WPAM_Auction_State::SUSPENDED;
               }

               $now      = current_datetime()->getTimestamp();
               $start_ts = strtotime( get_post_meta( $auction_id, '_auction_start', true ) );
               $end_ts   = strtotime( get_post_meta( $auction_id, '_auction_end', true ) );

               if ( $now >= $end_ts ) {
                       if ( get_post_meta( $auction_id, '_auction_winner', true ) ) {
                               update_post_meta( $auction_id, '_auction_status', 'completed' );
                               return WPAM_Auction_State::COMPLETED;
                       }
                       update_post_meta( $auction_id, '_auction_status', 'failed' );
                       return WPAM_Auction_State::FAILED;
               }

               if ( $start_ts <= $now && $now < $end_ts ) {
                       update_post_meta( $auction_id, '_auction_status', 'live' );
                       return WPAM_Auction_State::LIVE;
               }

               if ( $start_ts - $now <= self::ABOUT_TO_START_THRESHOLD && $start_ts > $now ) {
                       update_post_meta( $auction_id, '_auction_status', 'scheduled' );
                       return WPAM_Auction_State::ABOUT_TO_START;
               }

               update_post_meta( $auction_id, '_auction_status', 'scheduled' );
               return WPAM_Auction_State::SCHEDULED;
       }

        public function update_auction_states() {
                $args = array(
                        'post_type'   => 'product',
                        'post_status' => 'publish',
                        'meta_query'  => array(
                                array(
                                        'key'     => '_auction_start',
                                        'compare' => 'EXISTS',
                                ),
                        ),
                );

                $paged = 1;
                do {
                        $query = new \WP_Query(
                                array_merge(
                                        $args,
                                        array(
                                                'posts_per_page' => 50,
                                                'paged'          => $paged,
                                        )
                                )
                        );

                        foreach ( $query->posts as $post ) {
                                $state = $this->determine_state( $post->ID );
                                update_post_meta( $post->ID, '_auction_state', $state );
                        }

                        wp_reset_postdata();
                        $paged++;
                } while ( $query->have_posts() );
        }

        public function send_auction_reminders() {
                $now      = current_datetime()->getTimestamp();
                $timezone = wp_timezone();
                $args     = array(
                        'post_type'   => 'product',
                        'post_status' => 'publish',
                        'meta_query'  => array(
                                array(
                                        'key'     => '_auction_end',
                                        'value'   => array(
                                                wp_date( 'Y-m-d H:i:s', $now, $timezone ),
                                                wp_date( 'Y-m-d H:i:s', $now + self::REMINDER_THRESHOLD, $timezone )
                                        ),
                                        'compare' => 'BETWEEN',
                                        'type'    => 'DATETIME',
                                ),
                                array(
                                        'key'     => '_auction_start',
                                        'value'   => wp_date( 'Y-m-d H:i:s', $now, $timezone ),
                                        'compare' => '<=',
                                        'type'    => 'DATETIME',
                                ),
                                array(
                                        'key'     => '_auction_ended',
                                        'compare' => 'NOT EXISTS',
                                ),
                                array(
                                        'key'     => '_auction_reminder_sent',
                                        'compare' => 'NOT EXISTS',
                                ),
                        ),
                );

                $paged = 1;
                do {
                        $query = new \WP_Query(
                                array_merge(
                                        $args,
                                        array(
                                                'posts_per_page' => 50,
                                                'paged'          => $paged,
                                        )
                                )
                        );

                        foreach ( $query->posts as $post ) {
                                WPAM_Notifications::notify_auction_reminder( $post->ID );
                                update_post_meta( $post->ID, '_auction_reminder_sent', 1 );
                        }

                        wp_reset_postdata();
                        $paged++;
                } while ( $query->have_posts() );
        }

        public function register_cron_schedules( $schedules ) {
                if ( ! isset( $schedules['wpam_quarter_hour'] ) ) {
                        $schedules['wpam_quarter_hour'] = array(
                                'interval' => 15 * MINUTE_IN_SECONDS,
                                'display'  => __( 'Every 15 Minutes', 'wpam' ),
                        );
                }
                return $schedules;
        }

        /**
         * Parse a variable increment rules string.
         *
         * @param string $rules Raw rules from post meta.
         * @return array[] Array of [ 'max' => float, 'increment' => float ] pairs sorted by max.
         */
        public static function parse_increment_rules( $rules ) {
                $parsed = array();
                $lines  = preg_split( '/\r?\n/', (string) $rules );
                foreach ( $lines as $line ) {
                        $line = trim( $line );
                        if ( '' === $line ) {
                                continue;
                        }

                        list( $max, $inc ) = array_map( 'trim', explode( '|', $line ) + array( null, null ) );
                        if ( is_numeric( $max ) && is_numeric( $inc ) ) {
                                $parsed[] = array(
                                        'max'       => (float) $max,
                                        'increment' => (float) $inc,
                                );
                        }
                }

                usort(
                        $parsed,
                        function ( $a, $b ) {
                                if ( $a['max'] === $b['max'] ) {
                                        return 0;
                                }
                                return ( $a['max'] < $b['max'] ) ? -1 : 1;
                        }
                );

                return $parsed;
        }

        /**
         * Determine current bid increment for an auction.
         *
         * @param int   $auction_id Auction post ID.
         * @param float $highest    Current highest bid amount.
         * @return float Increment value.
         */
       public static function get_bid_increment( $auction_id, $highest ) {
               if ( get_post_meta( $auction_id, '_auction_variable_increment', true ) ) {
                       $rules_str = get_post_meta( $auction_id, '_auction_variable_increment_rules', true );
                       $rules     = self::parse_increment_rules( $rules_str );
                       if ( ! empty( $rules ) ) {
                               $increment = end( $rules )['increment'];
                               foreach ( $rules as $rule ) {
                                       if ( $highest <= $rule['max'] ) {
                                               $increment = $rule['increment'];
                                               break;
                                       }
                               }
                               return (float) $increment;
                       }
               }

                $increment = get_post_meta( $auction_id, '_auction_increment', true );
                if ( '' === $increment ) {
                        $increment = get_option( 'wpam_default_increment', 1 );
                }
               return (float) $increment;
       }

       public function cli_auction_status( $args, $assoc_args ) {
               $status = isset( $assoc_args['status'] ) ? $assoc_args['status'] : '';
               $query_args = array(
                       'post_type'      => 'product',
                       'post_status'    => 'publish',
                       'posts_per_page' => -1,
                       'meta_query'     => array(
                               array(
                                       'key'     => '_auction_status',
                                       'compare' => 'EXISTS',
                               ),
                       ),
               );
               if ( $status ) {
                       $query_args['meta_query'][] = array(
                               'key'   => '_auction_status',
                               'value' => $status,
                       );
               }

               $query = new \WP_Query( $query_args );
               $items = array();
               foreach ( $query->posts as $post ) {
                       $items[] = array(
                               'ID'     => $post->ID,
                               'title'  => $post->post_title,
                               'status' => get_post_meta( $post->ID, '_auction_status', true ),
                       );
               }
               \WP_CLI\Utils\format_items( 'table', $items, array( 'ID', 'title', 'status' ) );
       }
}
