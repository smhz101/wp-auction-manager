<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Simple event bus to broadcast events to registered providers.
 */
class WPAM_Event_Bus {
	/** @var array */
	protected static $listeners = array();

	/**
	 * Register a provider/listener with the event bus.
	 *
	 * @param object $listener Listener implementing handle_event method.
	 */
	public static function register( $listener ) {
		if ( is_object( $listener ) ) {
			self::$listeners[] = $listener;
		}
	}

	/**
	 * Dispatch an event to all registered listeners.
	 *
	 * @param string $event   Event name.
	 * @param array  $payload Event payload.
	 */
	public static function dispatch( $event, $payload = array() ) {
		foreach ( self::$listeners as $listener ) {
			if ( method_exists( $listener, 'handle_event' ) ) {
				$listener->handle_event( $event, $payload );
			}
		}
	}
}
