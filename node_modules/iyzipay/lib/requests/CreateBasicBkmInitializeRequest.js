'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    BkmInstallment = require('./model/BkmInstallment'),
    utils = require('../utils');

function CreateBasicBkmInitializeRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        connectorName: request['connectorName'],
        price: utils.formatPrice(request['price']),
        callbackUrl: request['callbackUrl'],
        buyerEmail: request['buyerEmail'],
        buyerId: request['buyerId'],
        buyerIp: request['buyerIp'],
        posOrderId: request['posOrderId'],
        installmentDetails: request['installmentDetails'].map(function (bkmInstallmentDetail) {
            return BkmInstallment.body(bkmInstallmentDetail);
        })
    });
}

util.inherits(CreateBasicBkmInitializeRequest, BaseRequest);

module.exports = CreateBasicBkmInitializeRequest;