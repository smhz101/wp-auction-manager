<?php
/**
 * Class and Function List:
 * Function list:
 * - __construct()
 * - register_template_hook()
 * - template_loader()
 * - enqueue_scripts()
 * - render_react_app()
 * - render_auction_meta()
 * - render_messages()
 * - pusher_auth()
 * - pusher_leave()
 * Classes list:
 * - WPAM_Public
 */
namespace WPAM\public;

use WPAM\Includes\WPAM_HTML;
use WPAM\Includes\WPAM_Pusher_Provider;

class WPAM_Public {
	/** @var WPAM_Pusher_Provider|null */
	protected $realtime_provider = null;

	public function __construct() {
		add_action(
			'wp_enqueue_scripts',
			array(
				$this,
				'enqueue_scripts',
			)
		);
		// add_shortcode( 'wpam_auction_app', array( $this, 'render_react_app' ) );
		// Register template loader on init so custom templates can be swapped in.
		add_action(
			'init',
			array(
				$this,
				'register_template_hook',
			)
		);

		add_action(
			'wp_ajax_wpam_pusher_auth',
			array(
				$this,
				'pusher_auth',
			)
		);
		add_action(
			'wp_ajax_nopriv_wpam_pusher_auth',
			array(
				$this,
				'pusher_auth',
			)
		);
		add_action(
			'wp_ajax_wpam_pusher_leave',
			array(
				$this,
				'pusher_leave',
			)
		);
		add_action(
			'wp_ajax_nopriv_wpam_pusher_leave',
			array(
				$this,
				'pusher_leave',
			)
		);

		$provider = get_option( 'wpam_realtime_provider', 'none' );
		if ( 'pusher' === $provider && class_exists( '\\WPAM\\Includes\\WPAM_Pusher_Provider' ) ) {
			$this->realtime_provider = new WPAM_Pusher_Provider();
		}
	}

	/**
	 * Hook the template loader filter.
	 */
	public function register_template_hook() {
		add_filter(
			'template_include',
			array(
				$this,
				'template_loader',
			)
		);
	}

	/**
	 * Conditionally load custom templates for auction views.
	 *
	 * @param string $template Current template path.
	 *
	 * @return string
	 */
	public function template_loader( $template ) {
		if ( is_singular( 'product' ) ) {
			$product = wc_get_product( get_queried_object_id() );
			if ( $product && 'auction' === $product->get_type() ) {
				$this->enqueue_scripts();
				add_action(
					'woocommerce_single_product_summary',
					array(
						$this,
						'render_auction_meta',
					),
					6
				);
				add_action(
					'woocommerce_single_product_summary',
					array(
						$this,
						'render_messages',
					),
					30
				);
			}
		}

		if ( is_tax( 'product_type', 'auction' ) ) {
			$this->enqueue_scripts();

			$custom = WPAM_PLUGIN_DIR . 'templates/auction-listing.php';
			return file_exists( $custom ) ? $custom : $template;
		}

		return $template;
	}

	public function enqueue_scripts() {
		$provider       = get_option( 'wpam_realtime_provider', 'none' );
		$pusher_enabled = ( 'pusher' === $provider );

		if ( $pusher_enabled ) {
			wp_enqueue_script( 'pusher-js', WPAM_PLUGIN_URL . 'public/vendor/js/pusher.min.js', array(), '8.4.0', true );
		}

		wp_enqueue_script( 'countdown', WPAM_PLUGIN_URL . 'public/vendor/js/countdown.min.js', array(), '2.6.0', true );

		wp_enqueue_style(
			'wpam-frontend',
			WPAM_PLUGIN_URL . 'public/css/wpam-frontend.css',
			array(
				'woocommerce-general',
			),
			WPAM_PLUGIN_VERSION
		);
		wp_enqueue_style( 'toastr', WPAM_PLUGIN_URL . 'public/vendor/css/toastr.min.css', array(), '2.1.4' );

		wp_enqueue_script(
			'toastr',
			WPAM_PLUGIN_URL . 'public/vendor/js/toastr.min.js',
			array(
				'jquery',
			),
			'2.1.4',
			true
		);

		wp_enqueue_script(
			'wpam-ajax-bid',
			WPAM_PLUGIN_URL . 'public/js/ajax-bid.js',
			array(
				'jquery',
				'countdown',
			),
			WPAM_PLUGIN_VERSION,
			true
		);
		wp_localize_script(
			'wpam-ajax-bid',
			'wpam_ajax',
			array(
				'ajax_url'            => admin_url( 'admin-ajax.php' ),
				'bid_nonce'           => wp_create_nonce( 'wpam_place_bid' ),
				'watchlist_nonce'     => wp_create_nonce( 'wpam_toggle_watchlist' ),
				'watchlist_get_nonce' => wp_create_nonce( 'wpam_get_watchlist' ),
				'highest_nonce'       => wp_create_nonce( 'wpam_get_highest_bid' ),
				'buy_now_nonce'       => wp_create_nonce( 'wpam_buy_now' ),
				'pusher_enabled'      => $pusher_enabled,
				'pusher_key'          => get_option( 'wpam_pusher_key' ),
				'pusher_cluster'      => get_option( 'wpam_pusher_cluster' ),
				'pusher_channel'      => 'wpam-auctions',
				'pusher_auth_nonce'   => wp_create_nonce( 'wpam_pusher_auth' ),
				'current_user_id'     => get_current_user_id(),
				'show_notices'        => (bool) get_option( 'wpam_enable_toasts', 1 ),
				'i18n'                => array(
					'max_bidder'       => __( "You're the max bidder", 'wpam' ),
					'winning'          => __( "You're winning", 'wpam' ),
					'outbid'           => __( "You've been outbid", 'wpam' ),
					'auction_extended' => __( 'Auction extended due to soft close', 'wpam' ),
					'max_reached'      => __( 'Max bid reached', 'wpam' ),
					'reserve_not_met'  => __( 'Reserve price not met', 'wpam' ),
				),
			)
		);

		wp_enqueue_script(
			'wpam-ajax-messages',
			WPAM_PLUGIN_URL . 'public/js/ajax-messages.js',
			array(
				'jquery',
			),
			WPAM_PLUGIN_VERSION,
			true
		);
		wp_localize_script(
			'wpam-ajax-messages',
			'wpam_messages',
			array(
				'ajax_url'           => admin_url( 'admin-ajax.php' ),
				'message_nonce'      => wp_create_nonce( 'wpam_submit_question' ),
				'get_messages_nonce' => wp_create_nonce( 'wpam_get_messages' ),
			)
		);

		wp_register_script(
			'wpam-react-app',
			WPAM_PLUGIN_URL . 'public/js/react/auction-app.js',
			array(
				'wp-element',
				'wp-api-fetch',
			),
			WPAM_PLUGIN_VERSION,
			true
		);
		wp_localize_script(
			'wpam-react-app',
			'wpamReactData',
			array(
				'ajax_url'           => admin_url( 'admin-ajax.php' ),
				'bid_nonce'          => wp_create_nonce( 'wpam_place_bid' ),
				'watchlist_nonce'    => wp_create_nonce( 'wpam_toggle_watchlist' ),
				'message_nonce'      => wp_create_nonce( 'wpam_submit_question' ),
				'get_messages_nonce' => wp_create_nonce( 'wpam_get_messages' ),
				'highest_nonce'      => wp_create_nonce( 'wpam_get_highest_bid' ),
				'pusher_enabled'     => $pusher_enabled,
				'pusher_key'         => get_option( 'wpam_pusher_key' ),
				'pusher_cluster'     => get_option( 'wpam_pusher_cluster' ),
				'pusher_channel'     => 'wpam-auctions',
				'pusher_auth_nonce'  => wp_create_nonce( 'wpam_pusher_auth' ),
			)
		);
	}

	public function render_react_app( $atts = array() ) {
		$auction_id = 0;

		if ( ! empty( $atts['auction'] ) ) {
			$auction_id = absint( $atts['auction'] );
		} elseif ( is_singular( 'product' ) ) {
			$product = wc_get_product( get_the_ID() );
			if ( $product && 'auction' === $product->get_type() ) {
				$auction_id = get_the_ID();
			}
		}

		wp_enqueue_script( 'wpam-react-app' );
		wp_localize_script(
			'wpam-react-app',
			'wpamReactPage',
			array(
				'auction_id' => $auction_id,
			)
		);

		return '<div id="wpam-react-root"></div>';
	}

	public function render_auction_meta() {
		global $product;

		if ( ! $product || $product->get_type() !== 'auction' ) {
			return;
		}

		echo WPAM_HTML::render_auction_meta(
			$product->get_id(),
			array(
				'showCountdown' => true,
				'showBidForm'   => true,
				'showStatus'    => true,
				'showWatchlist' => true,
			)
		);
	}

	public function render_messages() {
		global $product;
		echo '<div class="wpam-messages">';
		echo '<h2>' . esc_html__( 'Questions & Answers', 'wpam' ) . '</h2>';
		echo '<div class="wpam-messages-list"></div>';
		if ( is_user_logged_in() ) {
			echo '<textarea class="wpam-message-input" rows="3"></textarea>';
			wp_nonce_field( 'wpam_submit_question', 'wpam_message_nonce', false );
			echo '<button class="wpam-message-button" data-auction-id="' . esc_attr( $product->get_id() ) . '">' . esc_html__( 'Submit Question', 'wpam' ) . '</button>';
		} else {
			echo '<p>' . esc_html__( 'Please login to ask a question.', 'wpam' ) . '</p>';
		}
		echo '</div>';
	}

	/**
	 * Authorize presence channel subscriptions for Pusher.
	 */
	public function pusher_auth() {
		if ( ! check_ajax_referer( 'wpam_pusher_auth', 'nonce', false ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Invalid nonce', 'wpam' ),
				),
				403
			);
		}

		if ( empty( $_POST['channel_name'] ) || empty( $_POST['socket_id'] ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Invalid request', 'wpam' ),
				)
			);
		}

		$channel   = sanitize_text_field( wp_unslash( $_POST['channel_name'] ) );
		$socket_id = sanitize_text_field( wp_unslash( $_POST['socket_id'] ) );
		$user_id   = get_current_user_id();

		if ( 0 === $user_id ) {
			wp_send_json_error(
				array(
					'message' => __( 'Please login', 'wpam' ),
				)
			);
		}

		if ( ! $this->realtime_provider || ! $this
			->realtime_provider
			->is_active() || ! function_exists( 'pusher_presence_auth' ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Pusher not configured', 'wpam' ),
				)
			);
		}

		$auth = pusher_presence_auth( $channel, $socket_id, (string) $user_id );
		$data = json_decode( $auth, true );

		if ( preg_match( '/presence-auction-(\d+)/', $channel, $m ) ) {
			$auction_id = absint( $m[1] );
			$this
				->realtime_provider
				->send_viewer_event( $auction_id, 'join' );
		}

		wp_send_json_success( $data );
	}

	/**
	 * Handle viewer leave events to update counts.
	 */
	public function pusher_leave() {
		check_ajax_referer( 'wpam_pusher_auth', 'nonce' );

		$user_id = get_current_user_id();

		if ( 0 === $user_id ) {
			wp_send_json_error(
				array(
					'message' => __( 'Please login', 'wpam' ),
				)
			);
		}

		if ( empty( $_POST['auction_id'] ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'Invalid request', 'wpam' ),
				)
			);
		}

		$auction_id = absint( $_POST['auction_id'] );

		if ( $this->realtime_provider && $this->realtime_provider->is_active() ) {
			$this
				->realtime_provider
				->send_viewer_event( $auction_id, 'leave' );
		}

		wp_send_json_success();
	}
}
