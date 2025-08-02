<?php
use WPAM\Includes\WPAM_Bid;
use WPAM\Includes\WPAM_Auction_State;

if ( ! function_exists( 'wc_create_order' ) ) {
    class WPAM_Test_Order {
        public $id = 1;
        public $items = [];
        public function __construct( $args = [] ) {}
        public function add_product( $product, $qty, $args ) { $this->items[] = $args; }
        public function calculate_totals() {}
        public function save() {}
        public function get_id() { return $this->id; }
    }
    function wc_create_order( $args = [] ) { return new WPAM_Test_Order( $args ); }
}
if ( ! function_exists( 'wc_get_product' ) ) {
    function wc_get_product( $id ) { return (object) [ 'id' => $id ]; }
}
if ( ! function_exists( 'wc_price' ) ) {
    function wc_price( $price ) { return '$' . $price; }
}

class Test_WPAM_Buy_Now extends WP_Ajax_UnitTestCase {
    public function set_up() : void {
        parent::set_up();
        new WPAM_Bid();
    }

    public function test_buy_now_creates_order_and_ends_auction() {
        $auction_id = $this->factory->post->create([
            'post_type' => 'product',
        ]);
        update_post_meta( $auction_id, '_auction_start', date( 'Y-m-d H:i:s', time() - 3600 ) );
        update_post_meta( $auction_id, '_auction_end', date( 'Y-m-d H:i:s', time() + 3600 ) );
        update_post_meta( $auction_id, '_auction_buy_now', 100 );
        update_post_meta( $auction_id, '_auction_enable_buy_now', 'yes' );

        $user_id = $this->factory->user->create();
        wp_set_current_user( $user_id );

        $_POST = [
            'nonce'      => wp_create_nonce( 'wpam_buy_now' ),
            'auction_id' => $auction_id,
        ];

        try {
            $this->_handleAjax( 'wpam_buy_now' );
        } catch ( WPAjaxDieContinueException $e ) {
            $response = json_decode( $this->_last_response, true );
            $this->assertTrue( $response['success'] );
            $this->assertEquals( WPAM_Auction_State::ENDED, get_post_meta( $auction_id, '_auction_state', true ) );
            $this->assertEquals( 'buy_now', get_post_meta( $auction_id, '_auction_ending_reason', true ) );
            $this->assertEquals( $user_id, intval( get_post_meta( $auction_id, '_auction_winner', true ) ) );
            $this->assertEquals( 1, intval( get_post_meta( $auction_id, '_auction_order_id', true ) ) );
            return;
        }
        $this->fail( 'Expected AJAX die.' );
    }
}
