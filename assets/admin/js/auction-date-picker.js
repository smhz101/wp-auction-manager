jQuery(function ($) {
    if (typeof flatpickr === 'function') {
        const tz = (window.wpamDatePicker && window.wpamDatePicker.timezone) ? window.wpamDatePicker.timezone : 'UTC';
        const pad = (n) => String(n).padStart(2, '0');
        const toTz = (date) => new Date(date.toLocaleString('en-US', { timeZone: tz }));
        const toTzIso = (date) => {
            const tzDate = toTz(date);
            const offset = -tzDate.getTimezoneOffset();
            const sign = offset >= 0 ? '+' : '-';
            const oh = pad(Math.floor(Math.abs(offset) / 60));
            const om = pad(Math.abs(offset) % 60);
            return (
                tzDate.getFullYear() +
                '-' + pad(tzDate.getMonth() + 1) +
                '-' + pad(tzDate.getDate()) +
                'T' + pad(tzDate.getHours()) +
                ':' + pad(tzDate.getMinutes()) +
                ':' + pad(tzDate.getSeconds()) +
                sign + oh + ':' + om
            );
        };

        function setup(selector) {
            const input = document.querySelector(selector);
            if (!input) {
                return;
            }

            flatpickr(input, {
                enableTime: true,
                enableSeconds: true,
                dateFormat: 'Z',
                altInput: true,
                altFormat: 'Y-m-d H:i:S',
                defaultDate: input.value || null,
                formatDate: (date, format, locale) => flatpickr.formatDate(toTz(date), format, locale),
                onChange: function (selectedDates, dateStr, instance) {
                    if (selectedDates.length) {
                        instance.input.value = toTzIso(selectedDates[0]);
                    }
                }
            });
        }

        setup('#_auction_start');
        setup('#_auction_end');
    }
});
