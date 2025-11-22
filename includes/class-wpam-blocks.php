<?php
namespace WPAM\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WPAM_Blocks {
	public function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'init', array( $this, 'register_patterns' ) );
	}

	public function register_blocks() {
		// Blocks are compiled to the build directory via `npm run build`.
		$block = register_block_type( WPAM_PLUGIN_DIR . 'build/blocks/auction' );
		if ( $block ) {
			if ( ! empty( $block->editor_script ) ) {
				wp_set_script_translations( $block->editor_script, 'wpam', WPAM_PLUGIN_DIR . 'languages' );
			}
			if ( ! empty( $block->view_script ) ) {
				wp_set_script_translations( $block->view_script, 'wpam', WPAM_PLUGIN_DIR . 'languages' );
			}
		}
	}

	public function register_patterns() {
		if ( function_exists( 'register_block_pattern' ) ) {
			$content = '';
			$file    = WPAM_PLUGIN_DIR . 'patterns/auction-details.php';
			if ( file_exists( $file ) ) {
				$content = include $file;
			}

			register_block_pattern(
				'wpam/auction-details',
				array(
					'title'       => __( 'Auction Details', 'wpam' ),
					'description' => __( 'Display auction countdown, status and bid form.', 'wpam' ),
					'content'     => $content,
					'categories'  => array( 'featured' ),
				)
			);
		}
	}
}
