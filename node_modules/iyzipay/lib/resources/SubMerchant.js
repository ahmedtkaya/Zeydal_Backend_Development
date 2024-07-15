'use strict';

var IyzipayResource = require('../IyzipayResource');

function SubMerchant() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/onboarding/submerchant',
            method: 'POST',
            requestModel: 'CreateSubMerchantRequest'
        },
        update: {
            path: '/onboarding/submerchant',
            method: 'PUT',
            requestModel: 'UpdateSubMerchantRequest'
        },
        retrieve: {
            path: '/onboarding/submerchant/detail',
            method: 'POST',
            requestModel: 'RetrieveSubMerchantRequest'
        }
    };
}

SubMerchant.prototype = new IyzipayResource();

module.exports = SubMerchant;