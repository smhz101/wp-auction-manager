<?php
namespace WPAM\Includes;

class WPAM_Blocks {
    public function __construct() {
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_action( 'init', [ $this, 'register_patterns' ] );
    }

    public function register_blocks() {
        // Blocks are compiled to the build directory via `npm run build`.
        register_block_type( WPAM_PLUGIN_DIR . 'build/blocks/auction' );
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
                [
                    'title'       => __( 'Auction Details', 'wpam' ),
                    'description' => __( 'Display auction countdown, status and bid form.', 'wpam' ),
                    'content'     => $content,
                    'categories'  => [ 'featured' ],
                ]
            );
        }
    }
}
