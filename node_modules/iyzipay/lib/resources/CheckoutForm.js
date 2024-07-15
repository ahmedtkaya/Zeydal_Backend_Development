'use strict';

var IyzipayResource = require('../IyzipayResource');

function CheckoutForm() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/iyzipos/checkoutform/auth/ecom/detail',
            method: 'POST',
            requestModel: 'RetrieveCheckoutFormRequest'
        }
    };
}

CheckoutForm.prototype = new IyzipayResource();

module.exports = CheckoutForm;