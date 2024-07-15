'use strict';

var IyzipayResource = require('../IyzipayResource');

function ApiTest() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/test',
            method: 'GET'
        }
    };
}

ApiTest.prototype = new IyzipayResource();

module.exports = ApiTest;