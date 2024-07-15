'use strict';

var IyzipayResource = require('../IyzipayResource');

function PeccoInitialize() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/pecco/initialize',
            method: 'POST',
            requestModel: 'CreatePeccoInitializeRequest'
        }
    };
}

PeccoInitialize.prototype = new IyzipayResource();

module.exports = PeccoInitialize;