jQuery(
	function ($) {
		var relistFields = $( '._auction_relist_limit_field, ._auction_relist_delay_field, ._auction_relist_price_adjustment_field' );
		function toggleRelist(){
			if ($( '#_auction_auto_relist' ).is( ':checked' )) {
				relistFields.show();
			} else {
				relistFields.hide();
			}
		}
		$( '#_auction_auto_relist' ).on( 'change', toggleRelist );
		toggleRelist();
	}
);
