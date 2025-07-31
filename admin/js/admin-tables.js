jQuery(
	function ($) {
		if ( $( '#wpam-auctions-table' ).length ) {
			$( '#wpam-auctions-table' ).DataTable(
				{
					ajax: {
						url: wpamTables.auctions_endpoint,
						beforeSend: function (xhr) {
							xhr.setRequestHeader( 'X-WP-Nonce', wpamTables.nonce ); },
						dataSrc: 'data'
					},
					paging: true,
					searching: true,
					columns: [
					{ data: 'title' },
					{ data: 'start' },
					{ data: 'end' },
					{ data: 'state' },
					{ data: 'reason' }
					]
				}
			);
		}
		if ( $( '#wpam-bids-table' ).length ) {
			var endpoint = wpamTables.bids_endpoint + '?auction_id=' + wpamTables.auction_id;
			$( '#wpam-bids-table' ).DataTable(
				{
					ajax: {
						url: endpoint,
						beforeSend: function (xhr) {
							xhr.setRequestHeader( 'X-WP-Nonce', wpamTables.nonce ); },
						dataSrc: 'data'
					},
					paging: true,
					searching: true,
					columns: [
					{ data: 'user' },
					{ data: 'amount' },
					{ data: 'bid_time' }
					]
				}
			);
		}
	}
);
