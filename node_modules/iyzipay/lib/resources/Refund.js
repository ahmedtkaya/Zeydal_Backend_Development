'use strict';

var IyzipayResource = require('../IyzipayResource');

function Refund() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/refund',
            method: 'POST',
            requestModel: 'CreateRefundRequest'
        }
    };
}

Refund.prototype = new IyzipayResource();

module.exports = Refund;