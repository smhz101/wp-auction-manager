<?php
declare(strict_types=1);

namespace WPAM\Includes\Support\Exceptions;

final class Forbidden_Exception extends Rest_Exception {
	public function __construct( $message = 'You do not have permission to perform this action.', $data = array(), $prev = null ) {
		parent::__construct( $message, 403, $data, $prev );
	}
}
