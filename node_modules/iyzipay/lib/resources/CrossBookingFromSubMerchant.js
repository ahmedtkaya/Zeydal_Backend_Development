'use strict';

var IyzipayResource = require('../IyzipayResource');

function CrossBookingFromSubMerchant() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/crossbooking/receive',
            method: 'POST',
            requestModel: 'CreateCrossBookingRequest'
        }
    };
}

CrossBookingFromSubMerchant.prototype = new IyzipayResource();

module.exports = CrossBookingFromSubMerchant;