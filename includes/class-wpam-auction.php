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
        echo '<div id="auction_product_data" class="panel woocommerce_options_panel hidden">';

        woocommerce_wp_select([
            'id'      => '_auction_type',
            'label'   => __( 'Auction Type', 'wpam' ),
            'options' => [
                'standard' => __( 'Standard', 'wpam' ),
                'reverse'  => __( 'Reverse', 'wpam' ),
                'sealed'   => __( 'Sealed', 'wpam' ),
            ],
        ]);

        woocommerce_wp_text_input([
            'id'   => '_auction_start',
            'label' => __( 'Start Date', 'wpam' ),
            'type' => 'datetime-local',
        ]);

        woocommerce_wp_text_input([
            'id'   => '_auction_end',
            'label' => __( 'End Date', 'wpam' ),
            'type' => 'datetime-local',
        ]);

        woocommerce_wp_text_input([
            'id'    => '_auction_reserve',
            'label' => __( 'Reserve Price', 'wpam' ),
            'type'  => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'    => '_auction_buy_now',
            'label' => __( 'Buy Now Price', 'wpam' ),
            'type'  => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'    => '_auction_increment',
            'label' => __( 'Minimum Increment', 'wpam' ),
            'type'  => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'    => '_auction_soft_close',
            'label' => __( 'Soft Close Minutes', 'wpam' ),
            'type'  => 'number',
            'custom_attributes' => [ 'step' => '1', 'min' => '0' ],
        ]);

        woocommerce_wp_checkbox([
            'id'    => '_auction_auto_relist',
            'label' => __( 'Auto Relist', 'wpam' ),
        ]);

        woocommerce_wp_text_input([
            'id'    => '_auction_max_bids',
            'label' => __( 'Max Bids Per User', 'wpam' ),
            'type'  => 'number',
            'custom_attributes' => [ 'step' => '1', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'    => '_auction_fee',
            'label' => __( 'Auction Fee', 'wpam' ),
            'type'  => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
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
            $end = wc_clean( wp_unslash( $_POST['_auction_end'] ) );
            update_post_meta( $post_id, '_auction_end', $end );
        } else {
            $end = get_post_meta( $post_id, '_auction_end', true );
        }

        $this->schedule_events( $post_id, $start, $end );
    }

    private function schedule_events( $post_id, $start, $end ) {
        $now = current_time( 'timestamp' );

        if ( $start ) {
            $start_ts = strtotime( $start );
            if ( $start_ts && $start_ts > $now ) {
                wp_clear_scheduled_hook( 'wpam_auction_start', [ $post_id ] );
                wp_schedule_single_event( $start_ts, 'wpam_auction_start', [ $post_id ] );
            }
        }

        if ( $end ) {
            $end_ts = strtotime( $end );
            if ( $end_ts && $end_ts > $now ) {
                wp_clear_scheduled_hook( 'wpam_auction_end', [ $post_id ] );
                wp_schedule_single_event( $end_ts, 'wpam_auction_end', [ $post_id ] );
            }
        }

        $fields = [
            '_auction_type',
            '_auction_reserve',
            '_auction_buy_now',
            '_auction_increment',
            '_auction_soft_close',
            '_auction_auto_relist',
            '_auction_max_bids',
            '_auction_fee',
        ];

        foreach ( $fields as $field ) {
            if ( isset( $_POST[ $field ] ) ) {
                $value = wc_clean( $_POST[ $field ] );
                update_post_meta( $post_id, $field, $value );
            } else {
                if ( '_auction_auto_relist' === $field ) {
                    update_post_meta( $post_id, $field, 'no' );
                }
            }
        }
    }

    public function handle_auction_start( $auction_id ) {
        update_post_meta( $auction_id, '_auction_status', 'active' );
    }

    public function handle_auction_end( $auction_id ) {
        global $wpdb;

        $table = $wpdb->prefix . 'wc_auction_bids';
        $row   = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, bid_amount FROM {$table} WHERE auction_id = %d ORDER BY bid_amount DESC, bid_time ASC LIMIT 1", $auction_id ) );

        if ( $row ) {
            update_post_meta( $auction_id, '_auction_winner', $row->user_id );

            $order = wc_create_order( [ 'customer_id' => $row->user_id ] );
            if ( ! is_wp_error( $order ) ) {
                $product = wc_get_product( $auction_id );
                if ( $product ) {
                    $order->add_product( $product, 1, [
                        'subtotal' => $row->bid_amount,
                        'total'    => $row->bid_amount,
                    ] );
                    $order->calculate_totals();
                }
            }
        }

        update_post_meta( $auction_id, '_auction_status', 'closed' );
    }
}
