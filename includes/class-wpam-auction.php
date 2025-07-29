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
            update_post_meta( $post_id, '_auction_end', wc_clean( $_POST['_auction_end'] ) );
        }
    }
}
