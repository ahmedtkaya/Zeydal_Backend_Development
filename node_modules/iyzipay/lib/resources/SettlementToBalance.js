'use strict';

var IyzipayResource = require('../IyzipayResource');

function SettlementToBalance() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/payment/settlement-to-balance/init',
            method: 'POST',
            requestModel: 'CreateSettlementToBalanceInitRequest'
        }
    };
}

SettlementToBalance.prototype = new IyzipayResource();

module.exports = SettlementToBalance;