<?php
declare(strict_types=1);

namespace WPAM\Includes\Support\Exceptions;

final class Unauthorized_Exception extends Rest_Exception {
	public function __construct( $message = 'Authentication required.', $data = array(), $prev = null ) {
		parent::__construct( $message, 401, $data, $prev );
	}
}
