'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    Buyer = require('./model/Buyer'),
    Address = require('./model/Address'),
    BasketItem = require('./model/BasketItem'),
    utils = require('../utils');

function CreatePeccoInitializeRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        price: utils.formatPrice(request['price']),
        basketId: request['basketId'],
        paymentGroup: request['paymentGroup'],
        buyer: Buyer.body(request["buyer"]),
        shippingAddress: Address.body(request["shippingAddress"]),
        billingAddress: Address.body(request["billingAddress"]),
        basketItems: request["basketItems"].map(function (basketItem) {
            return BasketItem.body(basketItem);
        }),
        callbackUrl: request["callbackUrl"],
        paymentSource: request["paymentSource"],
        currency: request["currency"],
        paidPrice: utils.formatPrice(request["paidPrice"])
    });
}

util.inherits(CreatePeccoInitializeRequest, BaseRequest);

module.exports = CreatePeccoInitializeRequest;