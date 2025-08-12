<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Install;
use WPAM\Includes\WPAM_Auction_State;

class Test_WPAM_REST_Bid extends WP_UnitTestCase {
	protected $auction_id;
	protected $user_id;

	public function set_up(): void {
		parent::set_up();
		WPAM_Install::activate();
		$this->auction_id = $this->factory->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $this->auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
		update_post_meta( $this->auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
		update_post_meta( $this->auction_id, '_auction_state', WPAM_Auction_State::LIVE );
		update_post_meta( $this->auction_id, '_auction_reserve', 50 );
		$this->user_id = $this->factory->user->create( array( 'role' => 'auction_bidder' ) );
		wp_set_current_user( $this->user_id );
	}

	public function test_reserve_price_violation() {
		$request = new WP_REST_Request( 'POST', '/wpam/bid' );
		$request->set_param( 'auction_id', $this->auction_id );
		$request->set_param( 'bid', 10 );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$response = WPAM_Bid::rest_place_bid( $request );
		$this->assertInstanceOf( 'WP_Error', $response );
		$this->assertSame( 'wpam_reserve', $response->get_error_code() );
	}

	public function test_transaction_and_locking() {
		global $wpdb;
		$request = new WP_REST_Request( 'POST', '/wpam/bid' );
		$request->set_param( 'auction_id', $this->auction_id );
		$request->set_param( 'bid', 60 );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$wpdb->save_queries = true;
		$wpdb->queries      = array();
		WPAM_Bid::rest_place_bid( $request );
		$queries            = wp_list_pluck( $wpdb->queries, 0 );
		$wpdb->save_queries = false;

		$has_transaction = false;
		$has_lock        = false;
		foreach ( $queries as $sql ) {
			if ( stripos( $sql, 'START TRANSACTION' ) !== false ) {
				$has_transaction = true;
			}
			if ( stripos( $sql, 'FOR UPDATE' ) !== false ) {
				$has_lock = true;
			}
		}
		$this->assertTrue( $has_transaction );
		$this->assertTrue( $has_lock );
	}
}
