'use strict';

var IyzipayResource = require('../IyzipayResource');

function Disapproval() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/item/disapprove',
            method: 'POST',
            requestModel: 'CreateApprovalRequest'
        }
    };
}

Disapproval.prototype = new IyzipayResource();

module.exports = Disapproval;