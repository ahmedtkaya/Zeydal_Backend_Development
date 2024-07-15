'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    utils = require('../utils');

function CreateCrossBookingRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        subMerchantKey: request['subMerchantKey'],
        price: utils.formatPrice(request['price']),
        reason: request['reason'],
        currency: request["currency"]
    });
}

util.inherits(CreateCrossBookingRequest, BaseRequest);

module.exports = CreateCrossBookingRequest;