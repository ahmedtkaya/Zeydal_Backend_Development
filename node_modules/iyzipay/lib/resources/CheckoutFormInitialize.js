'use strict';

var IyzipayResource = require('../IyzipayResource');

function CheckoutFormInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/checkoutform/initialize/auth/ecom',
            method: 'POST',
            requestModel: 'CreateCheckoutFormInitializeRequest'
        }
    };
}

CheckoutFormInitialize.prototype = new IyzipayResource();

module.exports = CheckoutFormInitialize;