jQuery(function($){
    toastr.options.positionClass = 'toast-top-right';
    toastr.options.timeOut = 3000;
    function loadMessages(auctionId){
        $.post(
            wpam_messages.ajax_url,
            {
                action: 'wpam_get_messages',
                auction_id: auctionId,
                nonce: wpam_messages.get_messages_nonce
            },
            function(res){
                if(res.success){
                    const list = $('.wpam-messages-list').empty();
                    res.data.messages.forEach(function(msg){
                        const item = $('<div class="wpam-message"></div>').text(msg.user + ': ' + msg.message);
                        list.append(item);
                    });
                }
            }
        );
    }

    $('.wpam-message-button').on('click', function(e){
        e.preventDefault();
        const auctionId = $(this).data('auction-id');
        const textarea = $(this).siblings('.wpam-message-input');
        $.post(
            wpam_messages.ajax_url,
            {
                action: 'wpam_submit_question',
                auction_id: auctionId,
                message: textarea.val(),
                nonce: wpam_messages.message_nonce
            },
            function(res){
                if(res.success){
                    toastr.success(res.data.message);
                    textarea.val('');
                    loadMessages(auctionId);
                } else {
                    toastr.error(res.data.message);
                }
            }
        );
    });

    if($('.wpam-message-button').length){
        loadMessages($('.wpam-message-button').data('auction-id'));
    }
});
