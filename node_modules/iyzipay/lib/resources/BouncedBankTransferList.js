'use strict';

var IyzipayResource = require('../IyzipayResource');

function BouncedBankTransferList() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/reporting/settlement/bounced',
            method: 'POST',
            requestModel: 'RetrieveTransactionsRequest'
        }
    };
}

BouncedBankTransferList.prototype = new IyzipayResource();

module.exports = BouncedBankTransferList;