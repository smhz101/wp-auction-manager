jQuery(function($){
    $('.wpam-bid-button').on('click', function(e){
        e.preventDefault();
        const bidInput = $(this).closest('form').find('.wpam-bid-input');
        const auctionId = $(this).data('auction-id');
        $.post(
            wpam_ajax.ajax_url,
            {
                action: 'wpam_place_bid',
                auction_id: auctionId,
                bid: bidInput.val()
            },
            function(res){
                alert(res.data.message);
            }
        );
    });

    $('.wpam-watchlist-button').on('click', function(e){
        e.preventDefault();
        const auctionId = $(this).data('auction-id');
        $.post(
            wpam_ajax.ajax_url,
            {
                action: 'wpam_toggle_watchlist',
                auction_id: auctionId
            },
            function(res){
                alert(res.data.message);
            }
        );
    });
});
