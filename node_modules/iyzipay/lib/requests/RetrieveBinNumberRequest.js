'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveBinNumberRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        binNumber: request['binNumber']
    });
}

util.inherits(RetrieveBinNumberRequest, BaseRequest);

module.exports = RetrieveBinNumberRequest;