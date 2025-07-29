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
        add_action( 'init', [ $this, 'schedule_cron' ] );
        add_action( 'wpam_check_ended_auctions', [ $this, 'check_ended_auctions' ] );
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

        $query = new WP_Query( $args );
        foreach ( $query->posts as $post ) {
            update_post_meta( $post->ID, '_auction_ended', 1 );
            WPAM_Notifications::notify_auction_end( $post->ID );
        }
        wp_reset_postdata();
    }
}
