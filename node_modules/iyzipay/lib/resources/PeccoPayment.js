'use strict';

var IyzipayResource = require('../IyzipayResource');

function PeccoPayment() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/pecco/auth',
            method: 'POST',
            requestModel: 'CreatePeccoPaymentRequest'
        }
    };
}

PeccoPayment.prototype = new IyzipayResource();

module.exports = PeccoPayment;