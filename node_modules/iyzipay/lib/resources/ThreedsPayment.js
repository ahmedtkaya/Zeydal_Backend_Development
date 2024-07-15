'use strict';

var IyzipayResource = require('../IyzipayResource');

function ThreedsPayment() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/3dsecure/auth',
            method: 'POST',
            requestModel: 'CreateThreedsPaymentRequest'
        },
        retrieve: {
            path: '/payment/detail',
            method: 'POST',
            requestModel: 'RetrievePaymentRequest'
        }
    };
}

ThreedsPayment.prototype = new IyzipayResource();

module.exports = ThreedsPayment;
