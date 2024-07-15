'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function CreateApprovalRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        paymentTransactionId: request['paymentTransactionId']
    });
}

util.inherits(CreateApprovalRequest, BaseRequest);

module.exports = CreateApprovalRequest;