<?php
get_header();
?>
<div class="wpam-my-bids">
    <h1><?php _e( 'My Bids', 'wpam' ); ?></h1>
    <?php if ( ! empty( $bids ) ) : ?>
        <ul class="wpam-bid-items">
            <?php foreach ( $bids as $bid ) : ?>
                <li>
                    <a href="<?php echo esc_url( $bid['url'] ); ?>">
                        <?php echo esc_html( $bid['title'] ); ?>
                    </a>
                    - <?php echo esc_html( wc_price( $bid['amount'] ) ); ?>
                    - <?php echo esc_html( $bid['time'] ); ?>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php else : ?>
        <p><?php _e( 'You have not placed any bids yet.', 'wpam' ); ?></p>
    <?php endif; ?>
</div>
<?php
get_footer();
