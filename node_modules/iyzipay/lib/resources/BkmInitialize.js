'use strict';

var IyzipayResource = require('../IyzipayResource');

function BkmInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/bkm/initialize',
            method: 'POST',
            requestModel: 'CreateBkmInitializeRequest'
        }
    };
}

BkmInitialize.prototype = new IyzipayResource();

module.exports = BkmInitialize;