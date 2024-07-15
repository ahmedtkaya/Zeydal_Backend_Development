'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveCardListRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        cardUserKey: request['cardUserKey']
    });
}

util.inherits(RetrieveCardListRequest, BaseRequest);

module.exports = RetrieveCardListRequest;