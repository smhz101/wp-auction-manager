<?php
namespace WPAM\Admin;

if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Auctions_Table extends \WP_List_Table {
    public function prepare_items() {
        $status = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : '';
        $args = [
            'post_type'      => 'product',
            'posts_per_page' => 20,
            'paged'          => $this->get_pagenum(),
            'tax_query'      => [
                [
                    'taxonomy' => 'product_type',
                    'field'    => 'slug',
                    'terms'    => 'auction',
                ],
            ],
            'meta_query'     => [],
        ];
        $now = current_time( 'mysql' );
        if ( 'upcoming' === $status ) {
            $args['meta_query'][] = [
                'key'     => '_auction_start',
                'value'   => $now,
                'compare' => '>',
                'type'    => 'DATETIME',
            ];
        } elseif ( 'ended' === $status ) {
            $args['meta_query'][] = [
                'key'     => '_auction_end',
                'value'   => $now,
                'compare' => '<',
                'type'    => 'DATETIME',
            ];
        } elseif ( 'active' === $status ) {
            $args['meta_query'][] = [
                'key'     => '_auction_start',
                'value'   => $now,
                'compare' => '<=',
                'type'    => 'DATETIME',
            ];
            $args['meta_query'][] = [
                'key'     => '_auction_end',
                'value'   => $now,
                'compare' => '>=',
                'type'    => 'DATETIME',
            ];
        }

        $query = new WP_Query( $args );
        $items  = [];
        foreach ( $query->posts as $post ) {
            $start = get_post_meta( $post->ID, '_auction_start', true );
            $end   = get_post_meta( $post->ID, '_auction_end', true );
            $items[] = [
                'ID'    => $post->ID,
                'title' => $post->post_title,
                'start' => $start,
                'end'   => $end,
            ];
        }
        $this->items = $items;
        $this->set_pagination_args( [
            'total_items' => $query->found_posts,
            'per_page'    => 20,
            'total_pages' => $query->max_num_pages,
        ] );
    }

    public function get_columns() {
        return [
            'title'  => __( 'Auction', 'wpam' ),
            'start'  => __( 'Start', 'wpam' ),
            'end'    => __( 'End', 'wpam' ),
            'status' => __( 'Status', 'wpam' ),
        ];
    }

    protected function column_title( $item ) {
        $edit_link = get_edit_post_link( $item['ID'] );
        $view_bids = add_query_arg(
            [
                'page'       => 'wpam-bids',
                'auction_id' => $item['ID'],
            ],
            admin_url( 'admin.php' )
        );
        $title   = '<strong><a href="' . esc_url( $edit_link ) . '">' . esc_html( $item['title'] ) . '</a></strong>';
        $actions = [
            'edit' => '<a href="' . esc_url( $edit_link ) . '">' . __( 'Edit', 'wpam' ) . '</a>',
            'bids' => '<a href="' . esc_url( $view_bids ) . '">' . __( 'View Bids', 'wpam' ) . '</a>',
        ];
        return $title . $this->row_actions( $actions );
    }

    protected function column_status( $item ) {
        $now   = current_time( 'timestamp' );
        $start = strtotime( $item['start'] );
        $end   = strtotime( $item['end'] );
        if ( $start > $now ) {
            return __( 'Upcoming', 'wpam' );
        } elseif ( $end < $now ) {
            return __( 'Ended', 'wpam' );
        } else {
            return __( 'Active', 'wpam' );
        }
    }

    public function get_views() {
        $current  = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : '';
        $base_url = remove_query_arg( [ 'status', 'paged' ] );
        $views    = [];
        $views['all']      = sprintf( '<a href="%s"%s>%s</a>', esc_url( $base_url ), $current === '' ? ' class="current"' : '', __( 'All', 'wpam' ) );
        $views['upcoming'] = sprintf( '<a href="%s"%s>%s</a>', esc_url( add_query_arg( 'status', 'upcoming', $base_url ) ), $current === 'upcoming' ? ' class="current"' : '', __( 'Upcoming', 'wpam' ) );
        $views['active']   = sprintf( '<a href="%s"%s>%s</a>', esc_url( add_query_arg( 'status', 'active', $base_url ) ), $current === 'active' ? ' class="current"' : '', __( 'Active', 'wpam' ) );
        $views['ended']    = sprintf( '<a href="%s"%s>%s</a>', esc_url( add_query_arg( 'status', 'ended', $base_url ) ), $current === 'ended' ? ' class="current"' : '', __( 'Ended', 'wpam' ) );
        return $views;
    }

    public function no_items() {
        _e( 'No auctions found.', 'wpam' );
    }

    protected function column_default( $item, $column_name ) {
        return isset( $item[ $column_name ] ) ? esc_html( $item[ $column_name ] ) : '';
    }
}
