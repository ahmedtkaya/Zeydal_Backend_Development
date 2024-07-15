'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    utils = require('../utils');

function CreatePaymentPostAuthRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        paymentId: request['paymentId'],
        ip: request['ip'],
        paidPrice: utils.formatPrice(request['paidPrice']),
        currency: request["currency"]
    });
}

util.inherits(CreatePaymentPostAuthRequest, BaseRequest);

module.exports = CreatePaymentPostAuthRequest;