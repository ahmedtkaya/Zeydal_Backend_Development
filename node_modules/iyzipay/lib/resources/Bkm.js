'use strict';

var IyzipayResource = require('../IyzipayResource');

function Bkm() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/bkm/auth/detail',
            method: 'POST',
            requestModel: 'RetrieveBkmRequest'
        }
    };
}

Bkm.prototype = new IyzipayResource();

module.exports = Bkm;