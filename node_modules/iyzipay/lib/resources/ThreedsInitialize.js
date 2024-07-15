'use strict';

var IyzipayResource = require('../IyzipayResource');

function ThreedsInitializ() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/3dsecure/initialize',
            method: 'POST',
            requestModel: 'CreatePaymentRequest'
        }
    };
}

ThreedsInitializ.prototype = new IyzipayResource();

module.exports = ThreedsInitializ;
