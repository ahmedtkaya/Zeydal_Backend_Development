'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrievePaymentRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        paymentId: request['paymentId'],
        paymentConversationId: request['paymentConversationId']
    });
}

util.inherits(RetrievePaymentRequest, BaseRequest);

module.exports = RetrievePaymentRequest;