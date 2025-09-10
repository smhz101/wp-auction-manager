<?php
declare(strict_types=1);

namespace WPAM\Includes\Support\Exceptions;

use Exception;

/**
 * Base typed exception for REST layer.
 * Controllers/permissions can throw these; Base_Controller converts to WP_Error.
 */
abstract class Rest_Exception extends Exception {

	/** @var int */
	protected $status;

	/** @var array */
	protected $data;

	/**
	 * @param string         $message
	 * @param int            $status
	 * @param array          $data
	 * @param \Throwable|nil $prev
	 */
	public function __construct( $message, $status = 400, $data = array(), $prev = null ) {
		parent::__construct( $message, 0, $prev );
		$this->status = (int) $status;
		$this->data   = is_array( $data ) ? $data : array();
	}

	/** @return int */
	public function get_status() {
	 return $this->status;
	}

	/** @return array */
	public function get_data() {
	 return $this->data;
	}

	/** @return string machine error code like 'wpam_validation_exception' */
	public function get_error_code() {
		$short = strrchr( static::class, '\\' );
		$short = $short ? substr( $short, 1 ) : static::class;
		return 'wpam_' . strtolower( preg_replace( '/([a-z])([A-Z])/', '$1_$2', $short ) );
	}
}
