<?php
namespace WPAM\Includes;
if ( class_exists( 'WC_Product' ) && ! class_exists( 'WC_Product_Auction' ) ) {
    class WC_Product_Auction extends \WC_Product {
        public function get_type() {
            return 'auction';
        }
    }
}

class WPAM_Auction {
    public function __construct() {
        add_action( 'init', [ $this, 'register_product_type' ] );
        add_filter( 'woocommerce_product_data_tabs', [ $this, 'add_product_data_tab' ] );
        add_action( 'woocommerce_product_data_panels', [ $this, 'add_product_data_fields' ] );
        add_action( 'woocommerce_process_product_meta_auction', [ $this, 'save_product_data' ] );
        add_action( 'wpam_handle_auction_end', [ $this, 'handle_auction_end' ] );
        add_action( 'init', [ $this, 'schedule_cron' ] );
        add_action( 'wpam_check_ended_auctions', [ $this, 'check_ended_auctions' ] );
        add_action( 'wpam_auction_start', [ $this, 'handle_auction_start' ] );
        add_action( 'wpam_auction_end', [ $this, 'handle_auction_end' ] );
    }

    public function register_product_type() {
        add_filter( 'product_type_selector', [ $this, 'add_product_type' ] );
    }

    public function add_product_type( $types ) {
        $types['auction'] = __( 'Auction', 'wpam' );
        return $types;
    }

    public function add_product_data_tab( $tabs ) {
        $tabs['auction'] = [
            'label'  => __( 'Auction', 'wpam' ),
            'target' => 'auction_product_data',
            'class'  => [ 'show_if_auction', 'auction_tab' ],
        ];
        return $tabs;
    }

    public function add_product_data_fields() {
        global $post;
        $post_id = $post ? $post->ID : 0;
        echo '<div id="auction_product_data" class="panel woocommerce_options_panel hidden">';

        woocommerce_wp_select([
            'id'          => '_auction_type',
            'label'       => __( 'Auction Type', 'wpam' ),
            'description' => __( 'Select the bidding style for this auction.', 'wpam' ),
            'desc_tip'    => true,
            'options'     => [
                'standard' => __( 'Standard', 'wpam' ),
                'reverse'  => __( 'Reverse', 'wpam' ),
                'sealed'   => __( 'Sealed', 'wpam' ),
            ],
            'value'       => get_post_meta( $post_id, '_auction_type', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_start',
            'label'       => __( 'Start Date', 'wpam' ),
            'type'        => 'datetime-local',
            'description' => __( 'When bidding opens.', 'wpam' ),
            'desc_tip'    => true,
            'value'       => get_post_meta( $post_id, '_auction_start', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_end',
            'label'       => __( 'End Date', 'wpam' ),
            'type'        => 'datetime-local',
            'description' => __( 'When the auction will close.', 'wpam' ),
            'desc_tip'    => true,
            'value'       => get_post_meta( $post_id, '_auction_end', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_reserve',
            'label'       => __( 'Reserve Price', 'wpam' ),
            'description' => __( 'Minimum price required for a valid sale.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
            'value'       => get_post_meta( $post_id, '_auction_reserve', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_buy_now',
            'label'       => __( 'Buy Now Price', 'wpam' ),
            'description' => __( 'Optional instant purchase amount.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
            'value'       => get_post_meta( $post_id, '_auction_buy_now', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_increment',
            'label'       => __( 'Minimum Increment', 'wpam' ),
            'description' => __( 'Lowest amount a new bid must increase by.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
            'value'       => get_post_meta( $post_id, '_auction_increment', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_soft_close',
            'label'       => __( 'Soft Close Minutes', 'wpam' ),
            'description' => __( 'Number of minutes to extend if a bid is placed near the end.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '1', 'min' => '0' ],
            'value'       => get_post_meta( $post_id, '_auction_soft_close', true ),
        ]);

        woocommerce_wp_checkbox([
            'id'          => '_auction_auto_relist',
            'label'       => __( 'Auto Relist', 'wpam' ),
            'description' => __( 'Relist automatically when there is no winner.', 'wpam' ),
            'desc_tip'    => true,
            'value'       => get_post_meta( $post_id, '_auction_auto_relist', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_max_bids',
            'label'       => __( 'Max Bids Per User', 'wpam' ),
            'description' => __( 'Limit how many bids each user may place.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '1', 'min' => '0' ],
            'value'       => get_post_meta( $post_id, '_auction_max_bids', true ),
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_fee',
            'label'       => __( 'Auction Fee', 'wpam' ),
            'description' => __( 'Extra fee added to the winning bid.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
            'value'       => get_post_meta( $post_id, '_auction_fee', true ),
        ]);

        echo '</div>';
    }

    public function save_product_data( $post_id ) {
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
                wp_clear_scheduled_hook( 'wpam_handle_auction_end', [ $post_id ] );
                wp_schedule_single_event( $timestamp, 'wpam_handle_auction_end', [ $post_id ] );
            }
        }

        $meta_keys = [
            '_auction_type',
            '_auction_reserve',
            '_auction_buy_now',
            '_auction_increment',
            '_auction_soft_close',
            '_auction_auto_relist',
            '_auction_max_bids',
            '_auction_fee',
        ];

        foreach ( $meta_keys as $key ) {
            if ( isset( $_POST[ $key ] ) ) {
                update_post_meta( $post_id, $key, wc_clean( wp_unslash( $_POST[ $key ] ) ) );
            }
        }
    }
    public function handle_auction_start( $auction_id ) {
        do_action( 'wpam_before_auction_start', $auction_id );
        update_post_meta( $auction_id, '_auction_status', 'active' );
    }

    public function handle_auction_end( $auction_id ) {
        global $wpdb;

        $table   = $wpdb->prefix . 'wc_auction_bids';
        $highest = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount DESC LIMIT 1", $auction_id ), ARRAY_A );

        if ( ! $highest ) {
            if ( get_post_meta( $auction_id, '_auction_auto_relist', true ) ) {
                $duration = strtotime( get_post_meta( $auction_id, '_auction_end', true ) ) - strtotime( get_post_meta( $auction_id, '_auction_start', true ) );
                $start = current_time( 'mysql' );
                $end   = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + $duration );
                update_post_meta( $auction_id, '_auction_start', $start );
                update_post_meta( $auction_id, '_auction_end', $end );
                delete_post_meta( $auction_id, '_auction_ended' );
                wp_schedule_single_event( strtotime( $end ), 'wpam_auction_end', [ $auction_id ] );
            }
            return;
        }

        $user_id = intval( $highest['user_id'] );
        $amount  = floatval( $highest['bid_amount'] );

        $reserve = floatval( get_post_meta( $auction_id, '_auction_reserve', 0 ) );
        if ( $reserve && $amount < $reserve ) {
            if ( get_post_meta( $auction_id, '_auction_auto_relist', true ) ) {
                $duration = strtotime( get_post_meta( $auction_id, '_auction_end', true ) ) - strtotime( get_post_meta( $auction_id, '_auction_start', true ) );
                $start = current_time( 'mysql' );
                $end   = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + $duration );
                update_post_meta( $auction_id, '_auction_start', $start );
                update_post_meta( $auction_id, '_auction_end', $end );
                delete_post_meta( $auction_id, '_auction_ended' );
                wp_schedule_single_event( strtotime( $end ), 'wpam_auction_end', [ $auction_id ] );
            }
            return;
        }

        $order = wc_create_order( [ 'customer_id' => $user_id ] );
        $order->add_product( wc_get_product( $auction_id ), 1, [ 'subtotal' => $amount, 'total' => $amount ] );

        $fee = floatval( get_post_meta( $auction_id, '_auction_fee', 0 ) );
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
        $message = sprintf( __( 'Congratulations! You won with a bid of %s. Order #%d has been created.', 'wpam' ), wc_price( $amount ), $order->get_id() );
        wp_mail( $user->user_email, $subject, $message );

        $sid   = get_option( 'wpam_twilio_sid' );
        $token = get_option( 'wpam_twilio_token' );
        $from  = get_option( 'wpam_twilio_from' );
        $phone = get_user_meta( $user_id, 'billing_phone', true );

        if ( $sid && $token && $from && $phone && class_exists( 'WPAM_Twilio_Provider' ) ) {
            $twilio  = new WPAM_Twilio_Provider();
            $sms_msg = sprintf( __( 'You won auction %s for %s', 'wpam' ), get_the_title( $auction_id ), wc_price( $amount ) );
            $twilio->send( $phone, $sms_msg );
        }

        do_action( 'wpam_after_auction_end', $auction_id, $user_id, $amount );
    }

    public function schedule_cron() {
        if ( ! wp_next_scheduled( 'wpam_check_ended_auctions' ) ) {
            wp_schedule_event( time(), 'hourly', 'wpam_check_ended_auctions' );
        }
    }

    public function check_ended_auctions() {
        $args = [
            'post_type'      => 'product',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
            'meta_query'     => [
                [
                    'key'     => '_auction_end',
                    'value'   => current_time( 'mysql' ),
                    'compare' => '<=',
                    'type'    => 'DATETIME',
                ],
                [
                    'key'     => '_auction_ended',
                    'compare' => 'NOT EXISTS',
                ],
            ],
        ];

        $query = new \WP_Query( $args );
        foreach ( $query->posts as $post ) {
            update_post_meta( $post->ID, '_auction_ended', 1 );
            WPAM_Notifications::notify_auction_end( $post->ID );
        }
        wp_reset_postdata();
    }
}

