'use strict';

var IyzipayResource = require('../IyzipayResource');

var SubscriptionUpdateCardApiMethod = {
    UPDATE_WITH_SUBSCRIPTION_REFERENCE_CODE: 'updateWithSubscriptionReferenceCode',
};

function SubscriptionCard() {
    this._config = arguments[0];
    this._api = {
        update: {
            path: '/v2/subscription/card-update/checkoutform/initialize',
            method: 'POST',
            requestModel: 'UpdateSubscriptionCardRequest'
        },
        updateWithSubscriptionReferenceCode: {
            path: '/v2/subscription/card-update/checkoutform/initialize/with-subscription',
            method: 'POST',
            requestModel: 'UpdateSubscriptionCardWithSubscriptionReferenceCodeRequest'
        },
    };
}

SubscriptionCard.prototype = new IyzipayResource();

SubscriptionCard.prototype.updateWithSubscriptionReferenceCode = function (params, cb) {
    this._config.body = params;
    this._request(SubscriptionUpdateCardApiMethod.UPDATE_WITH_SUBSCRIPTION_REFERENCE_CODE, function (err, res, body) {
        cb(err, body);
    });
};

module.exports = SubscriptionCard;
