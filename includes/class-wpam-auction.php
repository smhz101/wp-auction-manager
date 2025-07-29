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
            'id'          => '_auction_type',
            'label'       => __( 'Auction Type', 'wpam' ),
            'description' => __( 'Select the bidding style for this auction.', 'wpam' ),
            'desc_tip'    => true,
            'options'     => [
                'standard' => __( 'Standard', 'wpam' ),
                'reverse'  => __( 'Reverse', 'wpam' ),
                'sealed'   => __( 'Sealed', 'wpam' ),
            ],
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_start',
            'label'       => __( 'Start Date', 'wpam' ),
            'type'        => 'datetime-local',
            'description' => __( 'When bidding opens.', 'wpam' ),
            'desc_tip'    => true,
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_end',
            'label'       => __( 'End Date', 'wpam' ),
            'type'        => 'datetime-local',
            'description' => __( 'When the auction will close.', 'wpam' ),
            'desc_tip'    => true,
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_reserve',
            'label'       => __( 'Reserve Price', 'wpam' ),
            'description' => __( 'Minimum price required for a valid sale.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_buy_now',
            'label'       => __( 'Buy Now Price', 'wpam' ),
            'description' => __( 'Optional instant purchase amount.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_increment',
            'label'       => __( 'Minimum Increment', 'wpam' ),
            'description' => __( 'Lowest amount a new bid must increase by.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_soft_close',
            'label'       => __( 'Soft Close Minutes', 'wpam' ),
            'description' => __( 'Number of minutes to extend if a bid is placed near the end.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '1', 'min' => '0' ],
        ]);

        woocommerce_wp_checkbox([
            'id'          => '_auction_auto_relist',
            'label'       => __( 'Auto Relist', 'wpam' ),
            'description' => __( 'Relist automatically when there is no winner.', 'wpam' ),
            'desc_tip'    => true,
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_max_bids',
            'label'       => __( 'Max Bids Per User', 'wpam' ),
            'description' => __( 'Limit how many bids each user may place.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '1', 'min' => '0' ],
        ]);

        woocommerce_wp_text_input([
            'id'          => '_auction_fee',
            'label'       => __( 'Auction Fee', 'wpam' ),
            'description' => __( 'Extra fee added to the winning bid.', 'wpam' ),
            'desc_tip'    => true,
            'type'        => 'number',
            'custom_attributes' => [ 'step' => '0.01', 'min' => '0' ],
        ]);

        echo '</div>';
    }

    public function save_product_data( $post_id ) {
        if ( isset( $_POST['_auction_start'] ) ) {
            update_post_meta( $post_id, '_auction_start', wc_clean( $_POST['_auction_start'] ) );
        }
        if ( isset( $_POST['_auction_end'] ) ) {
            update_post_meta( $post_id, '_auction_end', wc_clean( $_POST['_auction_end'] ) );
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
}
