<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
        exit; // Exit if accessed directly
}

final class WPAM_DB {
        public const BIDS             = 'wc_auction_bids';
        public const WATCHLISTS       = 'wc_auction_watchlists';
        public const MESSAGES         = 'wc_auction_messages';
        public const AUDIT            = 'wc_auction_audit';
        public const FLAGGED          = 'wc_flagged_users';
        public const KYC_FAILURES     = 'wc_kyc_failures';
        public const LOGS             = 'wc_auction_logs';
        public const NOTIFICATION_LOGS = 'wc_notification_logs';

        private static function db() {
                global $wpdb;
                return $wpdb;
        }

        public static function wpdb() {
                return self::db();
        }

        public static function table( string $name ): string {
                return self::db()->prefix . $name;
        }

        public static function prepare( string $query, array $args = array() ) {
                return $args ? self::db()->prepare( $query, $args ) : $query;
        }

        private static function handle_error(): void {
                $error = self::db()->last_error;
                if ( ! empty( $error ) ) {
                        throw new \RuntimeException( $error );
                }
        }

        public static function get_results( string $query, array $args = array(), string $output = OBJECT ) {
                $sql     = self::prepare( $query, $args );
                $results = self::db()->get_results( $sql, $output );
                self::handle_error();
                return $results;
        }

        public static function get_row( string $query, array $args = array(), string $output = OBJECT, int $y = 0 ) {
                $sql = self::prepare( $query, $args );
                $row = self::db()->get_row( $sql, $output, $y );
                self::handle_error();
                return $row;
        }

        public static function get_var( string $query, array $args = array(), int $x = 0, int $y = 0 ) {
                $sql = self::prepare( $query, $args );
                $var = self::db()->get_var( $sql, $x, $y );
                self::handle_error();
                return $var;
        }

        public static function get_col( string $query, array $args = array(), int $x = 0 ) {
                $sql = self::prepare( $query, $args );
                $col = self::db()->get_col( $sql, $x );
                self::handle_error();
                return $col;
        }

        public static function query( string $query, array $args = array() ) {
                $sql    = self::prepare( $query, $args );
                $result = self::db()->query( $sql );
                self::handle_error();
                return $result;
        }

        public static function insert( string $table, array $data, $format = null ) {
                $result = self::db()->insert( $table, $data, $format );
                self::handle_error();
                return $result;
        }

        public static function update( string $table, array $data, array $where, $format = null, $where_format = null ) {
                $result = self::db()->update( $table, $data, $where, $format, $where_format );
                self::handle_error();
                return $result;
        }

        public static function delete( string $table, array $where, $where_format = null ) {
                $result = self::db()->delete( $table, $where, $where_format );
                self::handle_error();
                return $result;
        }
}
