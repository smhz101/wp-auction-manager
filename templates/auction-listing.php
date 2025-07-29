<?php
get_header();
?>
<div class="auction-listing">
    <h1><?php _e('Auctions', 'wpam'); ?></h1>
    <?php
    $args = [
        'post_type'      => 'product',
        'posts_per_page' => 10,
        'tax_query'      => [
            [
                'taxonomy' => 'product_type',
                'field'    => 'slug',
                'terms'    => 'auction',
            ],
        ],
    ];
    $loop = new WP_Query( $args );
    if ( $loop->have_posts() ) :
        while ( $loop->have_posts() ) :
            $loop->the_post();
            wc_get_template_part( 'content', 'product' );
        endwhile;
        wp_reset_postdata();
    else :
        echo '<p>' . __( 'No auctions found', 'wpam' ) . '</p>';
    endif;
    ?>
</div>
<?php
get_footer();
