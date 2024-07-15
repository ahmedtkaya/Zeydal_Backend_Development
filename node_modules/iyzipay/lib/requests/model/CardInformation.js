'use strict';

function CardInformation() {
}

CardInformation.body = function (data) {

    return typeof data !== 'undefined' ? {
        cardAlias: data["cardAlias"],
        cardNumber: data["cardNumber"],
        expireYear: data["expireYear"],
        expireMonth: data["expireMonth"],
        cardHolderName: data["cardHolderName"]
    } : undefined
};

module.exports = CardInformation;