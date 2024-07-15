'use strict';

var IyzipayResource = require('../IyzipayResource');

function ThreedsInitializePreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/3dsecure/initialize/preauth',
            method: 'POST',
            requestModel: 'CreatePaymentRequest'
        }
    };
}

ThreedsInitializePreAuth.prototype = new IyzipayResource();

module.exports = ThreedsInitializePreAuth;
