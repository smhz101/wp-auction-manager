<?php
declare(strict_types=1);

namespace WPAM\Includes\Support\Exceptions;

final class Server_Error_Exception extends Rest_Exception {
	public function __construct( $message = 'Server error.', $data = array(), $prev = null ) {
		parent::__construct( $message, 500, $data, $prev );
	}
}
