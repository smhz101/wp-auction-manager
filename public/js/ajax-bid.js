jQuery(function ($) {
  function updateCountdown() {
    $('.wpam-countdown').each(function () {
      const $el = $(this);
      const start = parseInt($el.data('start'), 10) * 1000;
      const end = parseInt($el.data('end'), 10) * 1000;
      const now = Date.now();
      if (now >= end) {
        $el.text('0:00');
        return;
      }
      const target = now < start ? start : end;
      const diff = countdown(now, new Date(target)).value / 1000;
      const mins = Math.floor(diff / 60);
      const secs = Math.floor(diff % 60);
      $el.text(mins + ':' + ('0' + secs).slice(-2));
    });
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  $('.wpam-bid-button').on('click', function (e) {
    e.preventDefault();
    const bidInput = $(this).closest('form').find('.wpam-bid-input');
    const auctionId = $(this).data('auction-id');
    $.post(
      wpam_ajax.ajax_url,
      {
        action: 'wpam_place_bid',
        auction_id: auctionId,
        bid: bidInput.val(),
        nonce: wpam_ajax.bid_nonce,
      },
      function (res) {
        alert(res.data.message);
        if (res.success && res.data.new_end_ts) {
          $('.wpam-countdown').data('end', res.data.new_end_ts).attr('data-end', res.data.new_end_ts);
          updateCountdown();
        }
      }
    );
  });

  $('.wpam-watchlist-button').on('click', function (e) {
    e.preventDefault();
    const auctionId = $(this).data('auction-id');
    $.post(
      wpam_ajax.ajax_url,
      {
        action: 'wpam_toggle_watchlist',
        auction_id: auctionId,
        nonce: wpam_ajax.watchlist_nonce,
      },
      function (res) {
        alert(res.data.message);
      }
    );
  });

  function refreshBids() {
    $('.wpam-current-bid').each(function () {
      const bidEl = $(this);
      const auctionId = bidEl.data('auction-id');
      $.post(
        wpam_ajax.ajax_url,
        {
          action: 'wpam_get_highest_bid',
          auction_id: auctionId,
          nonce: wpam_ajax.highest_nonce,
        },
        function (res) {
          if (res.success) {
            bidEl.text(res.data.highest_bid);
          }
        }
      );
    });
  }

  refreshBids();

  if (wpam_ajax.pusher_enabled) {
    const pusher = new Pusher(wpam_ajax.pusher_key, { cluster: wpam_ajax.pusher_cluster });
    const channel = pusher.subscribe(wpam_ajax.pusher_channel);
    channel.bind('bid_update', function (data) {
      const el = $('.wpam-current-bid[data-auction-id="' + data.auction_id + '"]');
      el.text(data.bid);
    });
  } else {
    setInterval(refreshBids, 5000);
  }
});
