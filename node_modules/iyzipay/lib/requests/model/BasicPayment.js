'use strict';

var PaymentCard = require('./PaymentCard'),
    utils = require('../../utils');

function BasicPayment() {
}

BasicPayment.body = function (data) {

    return typeof data !== 'undefined' ? {
        locale: data['locale'],
        conversationId: data['conversationId'],
        price: utils.formatPrice(data['price']),
        paidPrice: utils.formatPrice(data['paidPrice']),
        installment: data['installment'],
        buyerEmail: data['buyerEmail'],
        buyerId: data['buyerId'],
        buyerIp: data['buyerIp'],
        posOrderId: data['posOrderId'],
        paymentCard: PaymentCard.body(data['paymentCard']),
        currency: data["currency"],
        connectorName: data['connectorName'],
        callbackUrl: data['callbackUrl']
    } : undefined
};

module.exports = BasicPayment;