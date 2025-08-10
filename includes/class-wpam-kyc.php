<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

use WP_REST_Server;
use WP_REST_Request;

class WPAM_KYC {
    public function __construct() {
        add_action( 'show_user_profile', [ $this, 'profile_field' ] );
        add_action( 'edit_user_profile', [ $this, 'profile_field' ] );
        add_action( 'personal_options_update', [ $this, 'save_profile_field' ] );
        add_action( 'edit_user_profile_update', [ $this, 'save_profile_field' ] );

        add_action( 'rest_api_init', [ $this, 'register_rest_route' ] );
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
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'handle_kyc_submission' ],
                'permission_callback' => function() {
                    return is_user_logged_in();
                },
                'args'                => [
                    'id_document' => [
                        'required' => true,
                    ],
                ],
            ]
        );
    }

    public function handle_kyc_submission( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $id_document = sanitize_text_field( $request['id_document'] );
        // In a real system, the document would be processed here.
        do_action( 'wpam_kyc_submitted', $user_id, $id_document );
        return rest_ensure_response( [ 'message' => __( 'Document received', 'wpam' ) ] );
    }
}
