'use strict';

var IyzipayResource = require('../IyzipayResource');

function CrossBookingToSubMerchant() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/crossbooking/send',
            method: 'POST',
            requestModel: 'CreateCrossBookingRequest'
        }
    };
}

CrossBookingToSubMerchant.prototype = new IyzipayResource();

module.exports = CrossBookingToSubMerchant;