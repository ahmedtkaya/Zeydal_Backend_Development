'use strict';

var IyzipayResource = require('../IyzipayResource');

function Approval() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/iyzipos/item/approve',
            method: 'POST',
            requestModel: 'CreateApprovalRequest'
        }
    };
}

Approval.prototype = new IyzipayResource();

module.exports = Approval;