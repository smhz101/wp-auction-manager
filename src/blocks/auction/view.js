// document.addEventListener('DOMContentLoaded', function () {
//     if (typeof jQuery === 'undefined') return;
//     jQuery(function ($) {
//         function updateCountdown() {
//             $('.wpam-countdown').each(function () {
//                 const $el = $(this);
//                 const start = parseInt($el.data('start'), 10) * 1000;
//                 const end = parseInt($el.data('end'), 10) * 1000;
//                 const now = Date.now();
//                 if (now >= end) {
//                     $el.text('0:00');
//                     return;
//                 }
//                 const target = now < start ? start : end;
//                 const diff = countdown(now, new Date(target)).value / 1000;
//                 const mins = Math.floor(diff / 60);
//                 const secs = Math.floor(diff % 60);
//                 $el.text(mins + ':' + ('0' + secs).slice(-2));
//             });
//         }
//         updateCountdown();
//         setInterval(updateCountdown, 1000);
//     });
// });

document.addEventListener('DOMContentLoaded', function () {
  if (typeof jQuery === 'undefined') return;

  jQuery(function ($) {
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

        // ✅ Force UTC-safe Date objects using ISO strings
        const fromUTC = new Date(new Date(from).toISOString());
        const toUTC = new Date(new Date(to).toISOString());

        const duration = countdown(fromUTC, toUTC, countdown.ALL);

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

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
});
