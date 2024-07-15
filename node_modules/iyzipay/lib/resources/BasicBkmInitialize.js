'use strict';

var IyzipayResource = require('../IyzipayResource');

function BasicBkmInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/bkm/initialize/basic',
            method: 'POST',
            requestModel: 'CreateBasicBkmInitializeRequest'
        }
    };
}

BasicBkmInitialize.prototype = new IyzipayResource();

module.exports = BasicBkmInitialize;