'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function DeleteCardRequest(request) {

    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        cardUserKey: request["cardUserKey"],
        cardToken: request["cardToken"]
    });
}

util.inherits(DeleteCardRequest, BaseRequest);

module.exports = DeleteCardRequest;