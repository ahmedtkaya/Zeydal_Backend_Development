'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicPayment() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/auth/basic',
            method: 'POST',
            requestModel: 'CreateBasicPaymentRequest'
        },
    };
}

BasicPayment.prototype = new IyzipayResource();

module.exports = BasicPayment;