document.addEventListener('DOMContentLoaded', function () {
    if (typeof jQuery === 'undefined') return;
    jQuery(function ($) {
        function updateCountdown() {
            $('.wpam-countdown').each(function () {
                const end = parseInt($(this).data('end'), 10);
                const now = Math.floor(Date.now() / 1000);
                let diff = end - now;
                if (diff < 0) diff = 0;
                const mins = Math.floor(diff / 60);
                const secs = diff % 60;
                $(this).text(mins + ':' + ('0' + secs).slice(-2));
            });
        }
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
});

