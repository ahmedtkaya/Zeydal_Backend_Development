'use strict';

var IyzipayResource = require('../IyzipayResource');

function RefundToBalance() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/refund-to-balance/init',
            method: 'POST',
            requestModel: 'CreateRefundToBalanceInitRequest'
        }
    };
}

RefundToBalance.prototype = new IyzipayResource();

module.exports = RefundToBalance;