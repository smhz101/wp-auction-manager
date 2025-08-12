<?php

namespace WPAM\Public;

/**
 * Handles shortcode registration for the plugin.
 */
class WPAM_Shortcodes {
    public function __construct() {
        add_shortcode( 'wpam_auctions', array( $this, 'shortcode_auctions' ) );
        // Future shortcodes should be registered here for centralized management.
    }

    /**
     * Renders a list of live auctions.
     *
     * @param array $atts Shortcode attributes.
     *
     * @return string
     */
    public function shortcode_auctions( $atts = array() ) {
        $atts = shortcode_atts(
            array(
                'per_page' => 10,
            ),
            $atts,
            'wpam_auctions'
        );

        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => (int) $atts['per_page'],
            'tax_query'      => array(
                array(
                    'taxonomy' => 'product_type',
                    'field'    => 'slug',
                    'terms'    => 'auction',
                ),
            ),
        );

        $query = new \WP_Query( $args );
        ob_start();
        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                wc_get_template_part( 'content', 'product' );
            }
            wp_reset_postdata();
        } else {
            echo '<p>' . esc_html__( 'No auctions found', 'wpam' ) . '</p>';
        }

        return ob_get_clean();
    }
}