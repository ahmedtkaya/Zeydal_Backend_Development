'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function UpdateSubscriptionCardWithSubscriptionReferenceCodeRequest(request) {
    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        subscriptionReferenceCode: request["subscriptionReferenceCode"],
        callbackUrl: request["callbackUrl"]
    });
}

util.inherits(UpdateSubscriptionCardWithSubscriptionReferenceCodeRequest, BaseRequest);

module.exports = UpdateSubscriptionCardWithSubscriptionReferenceCodeRequest;
