<?php
get_header();
?>
<div class="wpam-auctions-won">
	<h1><?php _e( 'Auctions Won', 'wpam' ); ?></h1>
	<?php if ( ! empty( $auctions ) ) : ?>
		<ul class="wpam-won-items">
			<?php foreach ( $auctions as $auction ) : ?>
				<li>
					<a href="<?php echo esc_url( $auction['url'] ); ?>">
						<?php echo esc_html( $auction['title'] ); ?>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php else : ?>
		<p><?php _e( 'You have not won any auctions yet.', 'wpam' ); ?></p>
	<?php endif; ?>
</div>
<?php
get_footer();
