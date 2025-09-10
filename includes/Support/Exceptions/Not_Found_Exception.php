<?php
declare(strict_types=1);

namespace WPAM\Includes\Support\Exceptions;

final class Not_Found_Exception extends Rest_Exception {
	public function __construct( $message = 'Resource not found.', $data = array(), $prev = null ) {
		parent::__construct( $message, 404, $data, $prev );
	}
}
