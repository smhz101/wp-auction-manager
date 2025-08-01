jQuery(function($){
    function toggleFields(){
        var type = $('#_auction_type').val();
        var reserve = $('._auction_reserve_field');
        var increment = $('._auction_increment_field');
        var variableInc = $('._auction_variable_increment_field, .show_if_variable_increment');
        var sealedOpts = $('._auction_proxy_bidding_field, ._auction_silent_bidding_field');

        if(type === 'sealed'){
            reserve.hide();
            increment.hide();
            variableInc.hide();
            sealedOpts.show();
        } else if(type === 'reverse'){
            reserve.show();
            increment.show();
            variableInc.show();
            sealedOpts.hide();
        } else { // standard
            reserve.hide();
            increment.show();
            variableInc.show();
            sealedOpts.hide();
        }
    }

    $('#_auction_type').on('change', toggleFields);
    toggleFields();
});
