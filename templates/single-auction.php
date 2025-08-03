<?php
get_header();
$start          = get_post_meta( get_the_ID(), '_auction_start', true );
$start_ts       = $start ? ( new \DateTimeImmutable( $start, new \DateTimeZone( 'UTC' ) ) )->getTimestamp() : 0;
$end            = get_post_meta( get_the_ID(), '_auction_end', true );
$end_ts         = $end ? ( new \DateTimeImmutable( $end, new \DateTimeZone( 'UTC' ) ) )->getTimestamp() : 0;
$status         = get_post_meta( get_the_ID(), '_auction_state', true );
$buy_now_enabled = get_post_meta( get_the_ID(), '_auction_enable_buy_now', true );
$buy_now_price   = get_post_meta( get_the_ID(), '_auction_buy_now', true );
?>
<div class="auction-single" data-status="<?php echo esc_attr( $status ); ?>" data-start="<?php echo esc_attr( $start_ts ); ?>" data-end="<?php echo esc_attr( $end_ts ); ?>">
    <h1><?php the_title(); ?></h1>
    <?php if ( ! in_array( $status, [ 'ended', 'canceled', 'suspended' ], true ) ) : ?>
        <p class="wpam-countdown" data-start="<?php echo esc_attr( $start_ts ); ?>" data-end="<?php echo esc_attr( $end_ts ); ?>" data-status="<?php echo esc_attr( $status ); ?>"></p>
    <?php endif; ?>
    <form class="wpam-bid-form">
        <input type="number" step="0.01" class="wpam-bid-input" />
        <?php wp_nonce_field( 'wpam_place_bid', 'wpam_bid_nonce', false ); ?>
        <button class="button wpam-bid-button" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>">
            <?php _e( 'Place Bid', 'wpam' ); ?>
        </button>
    </form>
    <div class="wpam-bid-status" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>"></div>
    <p><?php esc_html_e( 'Viewers:', 'wpam' ); ?> <span class="wpam-viewer-count" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>">0</span></p>
    <p><?php esc_html_e( 'Participants:', 'wpam' ); ?> <span class="wpam-participant-count" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>">0</span></p>
    <?php wp_nonce_field( 'wpam_toggle_watchlist', 'wpam_watchlist_nonce', false ); ?>
    <button class="button wpam-watchlist-button" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>">
        <?php _e( 'Toggle Watchlist', 'wpam' ); ?>
    </button>
    <?php if ( $buy_now_enabled && $buy_now_price ) : ?>
        <?php wp_nonce_field( 'wpam_buy_now', 'wpam_buy_now_nonce', false ); ?>
        <button class="button wpam-buy-now-button" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>">
            <?php printf( __( 'Buy Now for %s', 'wpam' ), function_exists( 'wc_price' ) ? wc_price( $buy_now_price ) : esc_html( $buy_now_price ) ); ?>
        </button>
    <?php endif; ?>

    <div class="wpam-messages">
        <h2><?php esc_html_e( 'Questions & Answers', 'wpam' ); ?></h2>
        <div class="wpam-messages-list"></div>
        <?php if ( is_user_logged_in() ) : ?>
            <textarea class="wpam-message-input" rows="3"></textarea>
            <?php wp_nonce_field( 'wpam_submit_question', 'wpam_message_nonce', false ); ?>
            <button class="wpam-message-button" data-auction-id="<?php echo esc_attr( get_the_ID() ); ?>">
                <?php esc_html_e( 'Submit Question', 'wpam' ); ?>
            </button>
        <?php else : ?>
            <p><?php esc_html_e( 'Please login to ask a question.', 'wpam' ); ?></p>
        <?php endif; ?>
    </div>
</div>
<?php
get_footer();
