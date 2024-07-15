'use strict';

var IyzipayResource = require('../IyzipayResource');

function RefundChargedFromMerchant() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/refund/merchant/charge',
            method: 'POST',
            requestModel: 'CreateRefundRequest'
        }
    };
}

RefundChargedFromMerchant.prototype = new IyzipayResource();

module.exports = RefundChargedFromMerchant;