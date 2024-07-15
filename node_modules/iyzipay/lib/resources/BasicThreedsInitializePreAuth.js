'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicThreedsInitializePreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/3dsecure/initialize/preauth/basic',
            method: 'POST',
            requestModel: 'CreateBasicPaymentRequest'
        }
    };
}

BasicThreedsInitializePreAuth.prototype = new IyzipayResource();

module.exports = BasicThreedsInitializePreAuth;
