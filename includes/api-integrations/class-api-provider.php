<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface WPAM_API_Provider {
    public function send( $to, $message );
}
