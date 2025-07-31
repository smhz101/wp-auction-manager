jQuery(function ($) {
  const i18n = wpam_ajax.i18n || {};
  toastr.options.positionClass = 'toast-top-right';
  toastr.options.timeOut = 3000;
  // function updateCountdown() {
  //   $('.wpam-countdown').each(function () {
  //     const $el = $(this);
  //     const start = parseInt($el.data('start'), 10) * 1000;
  //     const end = parseInt($el.data('end'), 10) * 1000;
  //     const now = Date.now();
  //     if (now >= end) {
  //       $el.text('0:00');
  //       return;
  //     }
  //     const target = now < start ? start : end;
  //     const diff = countdown(now, new Date(target)).value / 1000;
  //     const mins = Math.floor(diff / 60);
  //     const secs = Math.floor(diff % 60);
  //     $el.text(mins + ':' + ('0' + secs).slice(-2));
  //   });
  // }

  function updateCountdown() {
    $('.wpam-countdown').each(function () {
      const $el = $(this);
      const start = parseInt($el.data('start'), 10) * 1000;
      const end = parseInt($el.data('end'), 10) * 1000;
      const now = Date.now();

      if (now >= end) {
        $el.html('<strong>Ended</strong>');
        return;
      }

      const from = now < start ? start : now;
      const to = end;

      const duration = countdown(new Date(from), new Date(to), countdown.ALL);

      const units = [
        { label: 'Years', value: duration.years },
        { label: 'Months', value: duration.months },
        { label: 'Days', value: duration.days },
        { label: 'Hours', value: duration.hours },
        { label: 'Mins', value: duration.minutes },
        { label: 'Secs', value: duration.seconds },
      ];

      let content = '';

      units.forEach((unit) => {
        if (unit.value > 0) {
          content += `
          <div style="text-align:center;">
            <strong>${unit.value}</strong>
            <div>${unit.label}</div>
          </div>
        `;
        }
      });

      $el.html(`
      <div class="wpam-countdown-wrapper" style="display:flex; gap:10px; font-family:sans-serif;">
        ${content}
      </div>
    `);
    });
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  const userBids = {};
  const bidStatus = {};

  function setStatusText(id, text) {
    const el = $('.wpam-bid-status[data-auction-id="' + id + '"]');
    if (el.length) {
      el.text(text);
    }
  }

  function showToast(msg, type = 'info') {
    if (!wpam_ajax.show_notices) {
      return;
    }
    toastr[type](msg);
  }

  function applyStatus(id, status) {
    if (!status) return;
    const msg =
      status === 'max'
        ? i18n.max_bidder || "Max bid reached"
        : status === 'winning'
        ? i18n.winning || "You're winning"
        : i18n.outbid || "You're losing";
    setStatusText(id, msg);
    if (bidStatus[id] !== status) {
      bidStatus[id] = status;
      showToast(msg, status === 'outbid' ? 'warning' : 'info');
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
          if (res.data.status) {
            applyStatus(auctionId, res.data.status);
          }
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
            bidEl.text(res.data.highest_bid);
            if (res.data.statuses) {
              const current = parseInt(wpam_ajax.current_user_id, 10);
              applyStatus(auctionId, res.data.statuses[current]);
            }
            if (
              res.data.ending_reason === 'reserve_not_met' &&
              !bidStatus[auctionId + '_reserve']
            ) {
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
    const pusher = new Pusher(wpam_ajax.pusher_key, {
      cluster: wpam_ajax.pusher_cluster,
      authEndpoint: wpam_ajax.ajax_url,
      auth: { params: { action: 'wpam_pusher_auth', nonce: wpam_ajax.pusher_auth_nonce } },
    });

    // Subscribe to all unique auction IDs present on page
    const auctionIds = new Set();
    $('.wpam-current-bid').each(function () {
      const id = $(this).data('auction-id');
      if (id) auctionIds.add(id);
    });

    auctionIds.forEach(function (auctionId) {
      const channel = pusher.subscribe('auction-' + auctionId);
      channel.bind('bid_update', function (data) {
        if (!data || !data.auction_id || !data.bid) return;

        const el = $('.wpam-current-bid[data-auction-id="' + data.auction_id + '"]');
        el.text(data.bid);

        if (typeof data.participants !== 'undefined') {
          $('.wpam-participant-count[data-auction-id="' + data.auction_id + '"]').text(data.participants);
        }
        if (typeof data.viewers !== 'undefined') {
          $('.wpam-viewer-count[data-auction-id="' + data.auction_id + '"]').text(data.viewers);
        }

        if (data.statuses) {
          const current = parseInt(wpam_ajax.current_user_id, 10);
          applyStatus(data.auction_id, data.statuses[current]);
        }
      });
      channel.bind('bid_placed', function (data) {
        if (!data || !data.auction_id || !data.amount) return;
        const el = $('.wpam-current-bid[data-auction-id="' + data.auction_id + '"]');
        el.text(data.amount);
        if (typeof data.participants !== 'undefined') {
          $('.wpam-participant-count[data-auction-id="' + data.auction_id + '"]').text(data.participants);
        }
        if (data.statuses) {
          const current = parseInt(wpam_ajax.current_user_id, 10);
          applyStatus(data.auction_id, data.statuses[current]);
        }
        showToast(i18n.outbid || 'A new bid has been placed');
      });
      channel.bind('user_outbid', function (data) {
        if (!data || !data.auction_id || !data.user_id) return;
        const currentUser = parseInt(wpam_ajax.current_user_id, 10);
        if (currentUser && currentUser === parseInt(data.user_id, 10)) {
          showToast(i18n.outbid || "You've been outbid", 'warning');
        }
      });
      channel.bind('auction_status', function (data) {
        if (!data || !data.status) return;
        if (data.status === 'ended') {
          showToast(i18n.auction_ended || 'Auction ended', 'info');
        }
      });
      const presence = pusher.subscribe('presence-auction-' + auctionId);
      const updateViewers = function () {
        const count = presence.members.count || 0;
        $('.wpam-viewer-count[data-auction-id="' + auctionId + '"]').text(count);
      };
      presence.bind('pusher:subscription_succeeded', updateViewers);
      presence.bind('pusher:member_added', updateViewers);
      presence.bind('pusher:member_removed', updateViewers);
      channel.bind('viewer_update', function (data) {
        if (data && typeof data.viewers !== 'undefined') {
          $('.wpam-viewer-count[data-auction-id="' + auctionId + '"]').text(data.viewers);
        }
        if (data && typeof data.participants !== 'undefined') {
          $('.wpam-participant-count[data-auction-id="' + auctionId + '"]').text(data.participants);
        }
      });
    });

    window.addEventListener('unload', function () {
      auctionIds.forEach(function (auctionId) {
        const payload = new URLSearchParams({
          action: 'wpam_pusher_leave',
          nonce: wpam_ajax.pusher_auth_nonce,
          auction_id: auctionId,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(wpam_ajax.ajax_url, payload);
        } else {
          $.post(wpam_ajax.ajax_url, payload);
        }
      });
    });
  } else {
    setInterval(refreshBids, 5000);
  }
});
