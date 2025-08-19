<?php
use WPAM\Includes\WPAM_DB;

class Test_WPAM_DB extends WP_UnitTestCase {
        public function test_basic_crud() {
                $table = WPAM_DB::table( WPAM_DB::BIDS );
                WPAM_DB::insert( $table, array(
                        'auction_id' => 1,
                        'user_id'    => 1,
                        'bid_amount' => 5.5,
                        'bid_time'   => current_time( 'mysql', 1 ),
                ), array( '%d', '%d', '%f', '%s' ) );

                $count = WPAM_DB::get_var( "SELECT COUNT(*) FROM $table WHERE auction_id = %d", array( 1 ) );
                $this->assertEquals( 1, intval( $count ) );

                WPAM_DB::update( $table, array( 'bid_amount' => 6 ), array( 'auction_id' => 1, 'user_id' => 1 ), array( '%f' ), array( '%d', '%d' ) );
                $amount = WPAM_DB::get_var( "SELECT bid_amount FROM $table WHERE auction_id = %d AND user_id = %d", array( 1, 1 ) );
                $this->assertEquals( 6, floatval( $amount ) );

                WPAM_DB::delete( $table, array( 'auction_id' => 1 ), array( '%d' ) );
                $count = WPAM_DB::get_var( "SELECT COUNT(*) FROM $table WHERE auction_id = %d", array( 1 ) );
                $this->assertEquals( 0, intval( $count ) );
        }

        public function test_error_handling() {
                $this->expectException( RuntimeException::class );
                WPAM_DB::get_var( 'SELECT * FROM non_existing_table' );
        }
}
