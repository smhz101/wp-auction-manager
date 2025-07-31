jQuery(function ($) {
  const i18n = wpam_ajax.i18n || {};
  toastr.options.positionClass = 'toast-top-right';
  toastr.options.timeOut = 3000;
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

  const userBids = {};
  const bidStatus = {};

  function showToast(msg, type = 'info') {
    if (!wpam_ajax.show_notices) {
      return;
    }
    toastr[type](msg);
  }

  function checkBidStatus(id, highest, leadUser) {
    if (typeof userBids[id] === 'undefined') {
      return;
    }
    let status = '';
    const currentUser = parseInt(wpam_ajax.current_user_id, 10);
    if (leadUser && currentUser && leadUser === currentUser) {
      status = 'max';
    } else if (highest > userBids[id]) {
      status = 'outbid';
    } else if (highest === userBids[id]) {
      status = 'winning';
    }
    if (status && bidStatus[id] !== status) {
      bidStatus[id] = status;
      if (status === 'max') {
        showToast(i18n.max_bidder || "You're the max bidder");
      } else {
        showToast(status === 'winning' ? (i18n.winning || "You're winning") : (i18n.outbid || "You've been outbid"));
      }
    }
  }

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
        if (res.success) {
          toastr.success(res.data.message);
          if (res.data.max_reached) {
            showToast(i18n.max_reached || 'Max bid reached', 'warning');
          }
          userBids[auctionId] = parseFloat(bidInput.val());
          bidStatus[auctionId] = 'winning';
          showToast(i18n.winning || "You're winning");
          if (res.data.new_end_ts) {
            $('.wpam-countdown')
              .data('end', res.data.new_end_ts)
              .attr('data-end', res.data.new_end_ts);
            updateCountdown();
            showToast(i18n.auction_extended || 'Auction extended due to soft close');
          }
        } else {
          toastr.error(res.data.message);
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
        if (res.success) {
          toastr.success(res.data.message);
        } else {
          toastr.error(res.data.message);
        }
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
            const highest = parseFloat(res.data.highest_bid);
            const lead = res.data.lead_user ? parseInt(res.data.lead_user, 10) : 0;
            bidEl.text(res.data.highest_bid);
            checkBidStatus(auctionId, highest, lead);
            if (res.data.ending_reason === 'reserve_not_met' && !bidStatus[auctionId + '_reserve']) {
              showToast(i18n.reserve_not_met || 'Reserve price not met', 'warning');
              bidStatus[auctionId + '_reserve'] = true;
            }
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
      checkBidStatus(data.auction_id, parseFloat(data.bid));
    });
  } else {
    setInterval(refreshBids, 5000);
  }
});
