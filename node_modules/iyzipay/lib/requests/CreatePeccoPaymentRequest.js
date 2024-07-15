'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function CreatePeccoPaymentRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        token: request['token']
    });
}

util.inherits(CreatePeccoPaymentRequest, BaseRequest);

module.exports = CreatePeccoPaymentRequest;