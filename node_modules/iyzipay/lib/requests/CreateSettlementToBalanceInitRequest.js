'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    utils = require('../utils');

function CreateSettlementToBalanceInitRequest(request) {
    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        subMerchantKey: request['subMerchantKey'],
        callbackUrl: request["callbackUrl"],
        price: utils.formatPrice(request['price'])
    });
}

util.inherits(CreateSettlementToBalanceInitRequest, BaseRequest);

module.exports = CreateSettlementToBalanceInitRequest;