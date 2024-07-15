'use strict';

var IyzipayResource = require('../IyzipayResource');

function InstallmentInfo() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/payment/iyzipos/installment',
            method: 'POST',
            requestModel: 'RetrieveInstallmentInfoRequest'
        }
    };
}

InstallmentInfo.prototype = new IyzipayResource();

module.exports = InstallmentInfo;