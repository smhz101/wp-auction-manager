<?php
get_header();
?>
<div class="auction-single">
    <h1><?php the_title(); ?></h1>
    <form class="wpam-bid-form">
        <input type="number" step="0.01" class="wpam-bid-input" />
        <button class="wpam-bid-button" data-auction-id="<?php the_ID(); ?>">
            <?php _e( 'Place Bid', 'wpam' ); ?>
        </button>
    </form>
    <button class="wpam-watchlist-button" data-auction-id="<?php the_ID(); ?>">
        <?php _e( 'Toggle Watchlist', 'wpam' ); ?>
    </button>
</div>
<?php
get_footer();
