<?php
if ( class_exists( 'WC_Product' ) && ! class_exists( 'WC_Product_Auction' ) ) {
    class WC_Product_Auction extends WC_Product {
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
        echo '<div id="auction_product_data" class="panel woocommerce_options_panel hidden">';
        woocommerce_wp_text_input([
            'id'          => '_auction_start',
            'label'       => __( 'Start Date', 'wpam' ),
            'type'        => 'datetime-local',
        ]);
        woocommerce_wp_text_input([
            'id'          => '_auction_end',
            'label'       => __( 'End Date', 'wpam' ),
            'type'        => 'datetime-local',
        ]);
        echo '</div>';
    }

    public function save_product_data( $post_id ) {
        if ( isset( $_POST['_auction_start'] ) ) {
            update_post_meta( $post_id, '_auction_start', wc_clean( $_POST['_auction_start'] ) );
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
    }

    public function handle_auction_end( $auction_id ) {
        global $wpdb;
        $table   = $wpdb->prefix . 'wc_auction_bids';
        $highest = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM $table WHERE auction_id = %d ORDER BY bid_amount DESC LIMIT 1", $auction_id ), ARRAY_A );

        if ( ! $highest ) {
            return;
        }

        $user_id = intval( $highest['user_id'] );
        $amount  = floatval( $highest['bid_amount'] );

        $order = wc_create_order( [ 'customer_id' => $user_id ] );
        $order->add_product( wc_get_product( $auction_id ), 1, [ 'subtotal' => $amount, 'total' => $amount ] );
        $order->calculate_totals();

        update_post_meta( $auction_id, '_auction_winner', $user_id );
        update_post_meta( $auction_id, '_auction_order_id', $order->get_id() );
        update_post_meta( $auction_id, '_auction_sold', '1' );
        update_post_meta( $auction_id, '_stock_status', 'outofstock' );

        $user   = get_user_by( 'id', $user_id );
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
    }
}

