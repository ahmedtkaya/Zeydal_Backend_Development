'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveCheckoutFormRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        token: request['token']
    });
}

util.inherits(RetrieveCheckoutFormRequest, BaseRequest);

module.exports = RetrieveCheckoutFormRequest;