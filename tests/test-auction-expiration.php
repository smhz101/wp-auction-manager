<?php
use WPAM\Includes\WPAM_Auction;
use WPAM\Includes\WPAM_Install;

if ( ! function_exists( 'wc_create_order' ) ) {
	class WPAM_Test_Order {
		public $id = 1;
		public function add_product( $product, $qty, $args ) {}
		public function calculate_totals() {}
		public function save() {}
		public function get_id() {
			return $this->id; }
		public function add_item( $item ) {}
	}
	function wc_create_order( $args = array() ) {
		return new WPAM_Test_Order( $args );
	}
}
if ( ! function_exists( 'wc_get_product' ) ) {
	function wc_get_product( $id ) {
		return (object) array( 'id' => $id );
	}
}
if ( ! function_exists( 'wc_price' ) ) {
	function wc_price( $price ) {
		return '$' . $price;
	}
}
if ( ! function_exists( 'wc_format_decimal' ) ) {
	function wc_format_decimal( $val ) {
		return $val;
	}
}

class Test_WPAM_Auction_Expiration extends WP_UnitTestCase {
	private $auction;
	public function set_up(): void {
		parent::set_up();
		WPAM_Install::activate();
		$this->auction = new WPAM_Auction();
	}

	public function test_expired_auction_closed_and_winner_assigned() {
		$auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $auction_id, '_auction_start', gmdate( 'Y-m-d H:i:s', time() - 7200 ) );
		update_post_meta( $auction_id, '_auction_end', gmdate( 'Y-m-d H:i:s', time() - 3600 ) );

		$u1 = $this->factory->user->create();
		$u2 = $this->factory->user->create();

		global $wpdb;
		$table = $wpdb->prefix . 'wc_auction_bids';
		$now   = gmdate( 'Y-m-d H:i:s' );
		$wpdb->insert(
			$table,
			array(
				'auction_id' => $auction_id,
				'user_id'    => $u1,
				'bid_amount' => 10,
				'bid_time'   => $now,
			),
			array( '%d', '%d', '%f', '%s' )
		);
		$wpdb->insert(
			$table,
			array(
				'auction_id' => $auction_id,
				'user_id'    => $u2,
				'bid_amount' => 20,
				'bid_time'   => $now,
			),
			array( '%d', '%d', '%f', '%s' )
		);

		$this->auction->check_ended_auctions();

		$this->assertEquals( 1, intval( get_post_meta( $auction_id, '_auction_ended', true ) ) );
		$this->assertEquals( $u2, intval( get_post_meta( $auction_id, '_auction_winner', true ) ) );
		$this->assertEquals( 'completed', get_post_meta( $auction_id, '_auction_status', true ) );
	}
}
