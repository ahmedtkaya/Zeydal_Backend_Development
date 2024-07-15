'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveApmRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        paymentId: request['paymentId']
    });
}

util.inherits(RetrieveApmRequest, BaseRequest);

module.exports = RetrieveApmRequest;