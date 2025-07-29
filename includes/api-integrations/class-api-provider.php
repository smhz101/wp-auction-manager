<?php
namespace WPAM\Includes;

interface WPAM_API_Provider {
    public function send( $to, $message );
}
