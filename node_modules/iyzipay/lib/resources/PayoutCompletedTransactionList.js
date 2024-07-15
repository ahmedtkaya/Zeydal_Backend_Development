'use strict';

var IyzipayResource = require('../IyzipayResource');

function PayoutCompletedTransactionList() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/reporting/settlement/payoutcompleted',
            method: 'POST',
            requestModel: 'RetrieveTransactionsRequest'
        }
    };
}

PayoutCompletedTransactionList.prototype = new IyzipayResource();

module.exports = PayoutCompletedTransactionList;