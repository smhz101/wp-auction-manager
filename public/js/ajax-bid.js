jQuery(function($){
    function updateCountdown(){
        $('.wpam-countdown').each(function(){
            const end = parseInt($(this).data('end'), 10);
            const now = Math.floor(Date.now() / 1000);
            let diff = end - now;
            if(diff < 0){ diff = 0; }
            const mins = Math.floor(diff / 60);
            const secs = diff % 60;
            $(this).text(mins + ':' + ('0'+secs).slice(-2));
        });
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

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
                if(res.success && res.data.new_end_ts){
                    $('.wpam-countdown').data('end', res.data.new_end_ts);
                    updateCountdown();
                }
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
