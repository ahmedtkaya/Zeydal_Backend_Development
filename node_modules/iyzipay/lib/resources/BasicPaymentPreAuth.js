'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicPaymentPreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/preauth/basic',
            method: 'POST',
            requestModel: 'CreateBasicPaymentRequest'
        }
    };
}

BasicPaymentPreAuth.prototype = new IyzipayResource();

module.exports = BasicPaymentPreAuth;