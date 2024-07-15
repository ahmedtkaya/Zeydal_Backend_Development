'use strict';

var IyzipayResource = require('../IyzipayResource');

function BinNumber() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/bin/check',
            method: 'POST',
            requestModel: 'RetrieveBinNumberRequest'
        }
    };
}

BinNumber.prototype = new IyzipayResource();

module.exports = BinNumber;