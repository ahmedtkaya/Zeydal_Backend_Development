'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicThreedsPayment() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/3dsecure/auth/basic',
            method: 'POST',
            requestModel: 'CreateThreedsPaymentRequest'
        }
    };
}

BasicThreedsPayment.prototype = new IyzipayResource();

module.exports = BasicThreedsPayment;
