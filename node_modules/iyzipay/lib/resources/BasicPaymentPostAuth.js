'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicPaymentPostAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/postauth/basic',
            method: 'POST',
            requestModel: 'CreatePaymentPostAuthRequest'
        }
    };
}

BasicPaymentPostAuth.prototype = new IyzipayResource();

module.exports = BasicPaymentPostAuth;