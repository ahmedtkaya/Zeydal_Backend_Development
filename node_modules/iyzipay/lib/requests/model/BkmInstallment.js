'use strict';

var BkmInstallmentPrice = require('./BkmInstallmentPrice');

function BkmInstallment() {
}

BkmInstallment.body = function (data) {

    return typeof data !== 'undefined' ? {
        bankId: data["bankId"],
        installmentPrices: data["installmentPrices"].map(function (bkmInstallmentPrice) {
            return BkmInstallmentPrice.body(bkmInstallmentPrice);
        })
    } : undefined
};

module.exports = BkmInstallment;