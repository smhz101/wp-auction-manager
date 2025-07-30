jQuery(function($){
    if (typeof flatpickr === 'function') {
        flatpickr('#_auction_start', {
            enableTime: true,
            enableSeconds: true,
            dateFormat: 'Y-m-d H:i:S'
        });
        flatpickr('#_auction_end', {
            enableTime: true,
            enableSeconds: true,
            dateFormat: 'Y-m-d H:i:S'
        });
    }
});
