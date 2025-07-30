<?php
namespace WPAM\Admin;

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class WPAM_Auctions_Table extends \WP_List_Table {
	protected $auction_type = '';

	public function prepare_items() {
		$status             = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : '';
		$this->auction_type = isset( $_GET['auction_type'] ) ? sanitize_text_field( wp_unslash( $_GET['auction_type'] ) ) : '';
		$search             = isset( $_REQUEST['s'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['s'] ) ) : '';
		$args               = array(
			'post_type'      => 'product',
			'posts_per_page' => 20,
			'paged'          => $this->get_pagenum(),
			's'              => $search,
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_type',
					'field'    => 'slug',
					'terms'    => 'auction',
				),
			),
			'meta_query'     => array(),
		);
		$now                = current_time( 'mysql' );
		if ( $this->auction_type ) {
			$args['meta_query'][] = array(
				'key'   => '_auction_type',
				'value' => $this->auction_type,
			);
		}

		if ( 'upcoming' === $status ) {
			$args['meta_query'][] = array(
				'key'     => '_auction_start',
				'value'   => $now,
				'compare' => '>',
				'type'    => 'DATETIME',
			);
		} elseif ( 'ended' === $status ) {
			$args['meta_query'][] = array(
				'key'     => '_auction_end',
				'value'   => $now,
				'compare' => '<',
				'type'    => 'DATETIME',
			);
		} elseif ( 'active' === $status ) {
			$args['meta_query'][] = array(
				'key'     => '_auction_start',
				'value'   => $now,
				'compare' => '<=',
				'type'    => 'DATETIME',
			);
			$args['meta_query'][] = array(
				'key'     => '_auction_end',
				'value'   => $now,
				'compare' => '>=',
				'type'    => 'DATETIME',
			);
		}

		$query = new \WP_Query( $args );
		$items = array();
		foreach ( $query->posts as $post ) {
			$start   = get_post_meta( $post->ID, '_auction_start', true );
			$end     = get_post_meta( $post->ID, '_auction_end', true );
			$state   = get_post_meta( $post->ID, '_auction_state', true );
			$reason  = get_post_meta( $post->ID, '_auction_ending_reason', true );
			$items[] = array(
				'ID'     => $post->ID,
				'title'  => $post->post_title,
				'start'  => $start,
				'end'    => $end,
				'state'  => $state,
				'reason' => $reason,
			);
		}
		$this->items = $items;
		$this->set_pagination_args(
			array(
				'total_items' => $query->found_posts,
				'per_page'    => 20,
				'total_pages' => $query->max_num_pages,
			)
		);
	}

	protected function extra_tablenav( $which ) {
		if ( 'top' !== $which ) {
			return;
		}

		echo '<div class="alignleft actions wpam-auctions-filter">';
		echo '<select name="auction_type">';
		echo '<option value="">' . esc_html__( 'All Types', 'wpam' ) . '</option>';
		echo '<option value="standard"' . selected( $this->auction_type, 'standard', false ) . '>' . esc_html__( 'Standard', 'wpam' ) . '</option>';
		echo '<option value="reverse"' . selected( $this->auction_type, 'reverse', false ) . '>' . esc_html__( 'Reverse', 'wpam' ) . '</option>';
		echo '<option value="sealed"' . selected( $this->auction_type, 'sealed', false ) . '>' . esc_html__( 'Sealed', 'wpam' ) . '</option>';
		echo '</select>';
		submit_button( __( 'Filter', 'wpam' ), '', 'filter_action', false );
		echo '</div>';
	}

	public function get_columns() {
		return array(
			'title'  => __( 'Auction', 'wpam' ),
			'start'  => __( 'Start', 'wpam' ),
			'end'    => __( 'End', 'wpam' ),
			'state'  => __( 'State', 'wpam' ),
			'reason' => __( 'Ending Reason', 'wpam' ),
		);
	}

	protected function column_title( $item ) {
		$edit_link = get_edit_post_link( $item['ID'] );
		$view_bids = add_query_arg(
			array(
				'page'       => 'wpam-bids',
				'auction_id' => $item['ID'],
			),
			admin_url( 'admin.php' )
		);
		$title     = '<strong><a href="' . esc_url( $edit_link ) . '">' . esc_html( $item['title'] ) . '</a></strong>';
		$actions   = array(
			'edit' => '<a href="' . esc_url( $edit_link ) . '">' . __( 'Edit', 'wpam' ) . '</a>',
			'bids' => '<a href="' . esc_url( $view_bids ) . '">' . __( 'View Bids', 'wpam' ) . '</a>',
		);
		return $title . $this->row_actions( $actions );
	}

	protected function column_state( $item ) {
		return ucfirst( $item['state'] );
	}

	protected function column_reason( $item ) {
		return $item['reason'];
	}

	public function get_views() {
		$current           = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : '';
		$base_url          = remove_query_arg( array( 'status', 'paged' ) );
		$views             = array();
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
