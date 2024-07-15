'use strict';

var IyzipayResource = require('../IyzipayResource');

function Payment() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/auth',
            method: 'POST',
            requestModel: 'CreatePaymentRequest'
        },
        retrieve: {
            path: '/payment/detail',
            method: 'POST',
            requestModel: 'RetrievePaymentRequest'
        }
    };
}

Payment.prototype = new IyzipayResource();

module.exports = Payment;