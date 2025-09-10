<?php
declare(strict_types=1);

namespace WPAM\Includes\Support\Exceptions;

final class Validation_Exception extends Rest_Exception {
	/** @param array $errors field => message array */
	public function __construct( $message = 'Validation failed.', $errors = array(), $prev = null ) {
		parent::__construct( $message, 422, array( 'errors' => (array) $errors ), $prev );
	}
}
