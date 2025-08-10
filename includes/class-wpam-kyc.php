<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

use WP_REST_Server;
use WP_REST_Request;

class WPAM_KYC {
	public function __construct() {
		add_action( 'show_user_profile', array( $this, 'profile_field' ) );
		add_action( 'edit_user_profile', array( $this, 'profile_field' ) );
		add_action( 'personal_options_update', array( $this, 'save_profile_field' ) );
		add_action( 'edit_user_profile_update', array( $this, 'save_profile_field' ) );

		add_action( 'rest_api_init', array( $this, 'register_rest_route' ) );
	}

	public function profile_field( $user ) {
		?>
		<h2><?php esc_html_e( 'KYC Verification', 'wpam' ); ?></h2>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="wpam_kyc_verified"><?php esc_html_e( 'Verified', 'wpam' ); ?></label></th>
				<td>
					<input type="checkbox" name="wpam_kyc_verified" id="wpam_kyc_verified" value="1" <?php checked( get_user_meta( $user->ID, 'wpam_kyc_verified', true ), 1 ); ?> />
				</td>
			</tr>
		</table>
		<?php
	}

	public function save_profile_field( $user_id ) {
		if ( ! current_user_can( 'edit_user', $user_id ) ) {
			return false;
		}
		$value = isset( $_POST['wpam_kyc_verified'] ) ? 1 : 0;
		update_user_meta( $user_id, 'wpam_kyc_verified', $value );
	}

	public function register_rest_route() {
		register_rest_route(
			'wpam/v1',
			'/kyc',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_kyc_submission' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
				'args'                => array(
					'id_document' => array(
						'required' => true,
					),
				),
			)
		);
	}

	public function handle_kyc_submission( WP_REST_Request $request ) {
		$user_id = get_current_user_id();
		$nonce   = $request->get_header( 'X-WP-Nonce' );

		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			$this->log_failure( $user_id, 'invalid_nonce' );
			return new \WP_Error( 'rest_forbidden', __( 'Invalid nonce.', 'wpam' ), array( 'status' => 403 ) );
		}

		if ( ! current_user_can( 'read' ) ) {
			$this->log_failure( $user_id, 'missing_read_capability' );
			return new \WP_Error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'wpam' ), array( 'status' => 403 ) );
		}

		$id_document = sanitize_text_field( $request['id_document'] );

		// In a real system, the document would be processed here.
		do_action( 'wpam_kyc_submitted', $user_id, $id_document );

		return rest_ensure_response( array( 'message' => __( 'Document received', 'wpam' ) ) );
	}

	protected function log_failure( $user_id, $reason ) {
		global $wpdb;

		$table = $wpdb->prefix . 'wc_kyc_failures';
		$wpdb->insert(
			$table,
			array(
				'user_id'    => absint( $user_id ),
				'reason'     => $reason,
				'ip'         => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
				'user_agent' => isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '',
				'logged_at'  => wp_date( 'Y-m-d H:i:s', null, new \DateTimeZone( 'UTC' ) ),
			),
			array( '%d', '%s', '%s', '%s', '%s' )
		);
	}
}
