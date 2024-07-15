'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function RetrieveSubMerchantRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        subMerchantExternalId: request['subMerchantExternalId']
    });
}

util.inherits(RetrieveSubMerchantRequest, BaseRequest);

module.exports = RetrieveSubMerchantRequest;