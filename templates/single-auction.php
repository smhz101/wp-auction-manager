<?php
get_header();
?>
<div class="auction-single">
    <h1><?php the_title(); ?></h1>
    <?php
    $end = get_post_meta( get_the_ID(), '_auction_end', true );
    $end_ts = $end ? strtotime( $end ) : 0;
    ?>
    <p class="wpam-countdown" data-end="<?php echo esc_attr( $end_ts ); ?>"></p>
    <form class="wpam-bid-form">
        <input type="number" step="0.01" class="wpam-bid-input" />
        <?php wp_nonce_field( 'wpam_place_bid', 'wpam_bid_nonce', false ); ?>
        <button class="button wpam-bid-button" data-auction-id="<?php the_ID(); ?>">
            <?php _e( 'Place Bid', 'wpam' ); ?>
        </button>
    </form>
    <?php wp_nonce_field( 'wpam_toggle_watchlist', 'wpam_watchlist_nonce', false ); ?>
    <button class="button wpam-watchlist-button" data-auction-id="<?php the_ID(); ?>">
        <?php _e( 'Toggle Watchlist', 'wpam' ); ?>
    </button>

    <div class="wpam-messages">
        <h2><?php esc_html_e( 'Questions & Answers', 'wpam' ); ?></h2>
        <div class="wpam-messages-list"></div>
        <?php if ( is_user_logged_in() ) : ?>
            <textarea class="wpam-message-input" rows="3"></textarea>
            <?php wp_nonce_field( 'wpam_submit_question', 'wpam_message_nonce', false ); ?>
            <button class="wpam-message-button" data-auction-id="<?php the_ID(); ?>">
                <?php esc_html_e( 'Submit Question', 'wpam' ); ?>
            </button>
        <?php else : ?>
            <p><?php esc_html_e( 'Please login to ask a question.', 'wpam' ); ?></p>
        <?php endif; ?>
    </div>
</div>
<?php
get_footer();
