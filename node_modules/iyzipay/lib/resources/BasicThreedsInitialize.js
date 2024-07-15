'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicThreedsInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/3dsecure/initialize/basic',
            method: 'POST',
            requestModel: 'CreateBasicPaymentRequest'
        }
    };
}

BasicThreedsInitialize.prototype = new IyzipayResource();

module.exports = BasicThreedsInitialize;
