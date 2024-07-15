'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveBkmRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        token: request['token']
    });
}

util.inherits(RetrieveBkmRequest, BaseRequest);

module.exports = RetrieveBkmRequest;