'use strict';

var IyzipayResource = require('../IyzipayResource');

function CheckoutFormInitializePreAuth() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/checkoutform/initialize/preauth/ecom',
            method: 'POST',
            requestModel: 'CreateCheckoutFormInitializeRequest'
        }
    };
}

CheckoutFormInitializePreAuth.prototype = new IyzipayResource();

module.exports = CheckoutFormInitializePreAuth;