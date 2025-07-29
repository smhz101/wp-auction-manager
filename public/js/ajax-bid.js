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
                bid: bidInput.val(),
                nonce: wpam_ajax.bid_nonce
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
                auction_id: auctionId,
                nonce: wpam_ajax.watchlist_nonce
            },
            function(res){
                alert(res.data.message);
            }
        );
    });

    function refreshBids(){
        $('.wpam-current-bid').each(function(){
            const bidEl = $(this);
            const auctionId = bidEl.data('auction-id');
            $.post(
                wpam_ajax.ajax_url,
                {
                    action: 'wpam_get_highest_bid',
                    auction_id: auctionId,
                    nonce: wpam_ajax.highest_nonce
                },
                function(res){
                    if(res.success){
                        bidEl.text(res.data.highest_bid);
                    }
                }
            );
        });
    }

    refreshBids();
    setInterval(refreshBids, 5000);
});
