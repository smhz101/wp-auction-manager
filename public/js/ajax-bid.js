jQuery(function($){
    $('.wcap-bid-button').on('click', function(e){
        e.preventDefault();
        $.post(wcap_ajax.ajax_url, { action: 'wcap_place_bid' }, function(res){
            alert(res.data.message);
        });
    });
});
