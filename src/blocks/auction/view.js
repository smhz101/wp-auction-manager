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
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
});

