'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function CreateThreedsPaymentRequest(request) {

    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        paymentId: request["paymentId"],
        conversationData: request["conversationData"]
    });
}

util.inherits(CreateThreedsPaymentRequest, BaseRequest);

module.exports = CreateThreedsPaymentRequest;