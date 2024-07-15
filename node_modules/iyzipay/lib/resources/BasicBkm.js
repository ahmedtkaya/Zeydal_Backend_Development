'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicBkm() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/bkm/auth/detail/basic',
            method: 'POST',
            requestModel: 'RetrieveBkmRequest'
        }
    };
}

BasicBkm.prototype = new IyzipayResource();

module.exports = BasicBkm;