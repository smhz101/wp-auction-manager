(function ($) {
	$(
		function () {
			var $panel      = $( '.wpam-help-text' );
			var defaultText = $panel.text();
			$( '.wpam-fields-left' ).on(
				'focus mouseenter',
				'input, select, textarea',
				function () {
					var help = $( this ).data( 'help' );
					if (help) {
						$panel.text( help );
					}
				}
			).on(
				'blur mouseleave',
				'input, select, textarea',
				function () {
					setTimeout(
						function () {
							if ( ! $( '.wpam-fields-left' ).find( ':focus' ).length) {
								$panel.text( defaultText );
							}
						},
						0
					);
				}
			);
		}
	);
})( jQuery );
