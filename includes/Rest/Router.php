<?php
declare(strict_types=1);

namespace WPAM\Includes\Rest;

final class Router {

	/** @var array<int, Base_Controller> */
	private $controllers = array();

	public function __construct( Base_Controller ...$controllers ) {
		$this->controllers = $controllers;
	}

	public function register() {
		foreach ( $this->controllers as $controller ) {
			try {
				$controller->register_routes();
			} catch ( \Throwable $e ) {
				error_log( sprintf( 'WPAM route registration failed for %s: %s', get_class( $controller ), $e->getMessage() ) );
			}
		}
	}
}
