jQuery(function($){
    function loadMessages(auctionId){
        $.post(
            wpam_messages.ajax_url,
            {
                action: 'wpam_get_messages',
                auction_id: auctionId
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
                alert(res.data.message);
                if(res.success){
                    textarea.val('');
                    loadMessages(auctionId);
                }
            }
        );
    });

    if($('.wpam-message-button').length){
        loadMessages($('.wpam-message-button').data('auction-id'));
    }
});
