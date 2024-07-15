'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    CardInformation = require('./model/CardInformation');

function CreateCardRequest(request) {

    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        externalId: request["externalId"],
        email: request["email"],
        cardUserKey: request["cardUserKey"],
        card: CardInformation.body(request["card"])
    });
}

util.inherits(CreateCardRequest, BaseRequest);

module.exports = CreateCardRequest;