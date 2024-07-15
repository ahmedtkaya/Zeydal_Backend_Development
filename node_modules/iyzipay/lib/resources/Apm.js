'use strict';

var IyzipayResource = require('../IyzipayResource');

function Apm() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/apm/initialize',
            method: 'POST',
            requestModel: 'CreateApmInitializeRequest'
        },
        retrieve: {
            path: '/payment/apm/retrieve',
            method: 'POST',
            requestModel: 'RetrieveApmRequest'
        }
    };
}

Apm.prototype = new IyzipayResource();

module.exports = Apm;