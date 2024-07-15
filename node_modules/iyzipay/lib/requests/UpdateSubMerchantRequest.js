'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function UpdateSubMerchantRequest(request) {

    BaseRequest.call(this, {
        locale: request['locale'],
        conversationId: request['conversationId'],
        name: request['name'],
        email: request['email'],
        gsmNumber: request['gsmNumber'],
        address: request['address'],
        iban: request['iban'],
        taxOffice: request['taxOffice'],
        contactName: request['contactName'],
        contactSurname: request['contactSurname'],
        legalCompanyTitle: request['legalCompanyTitle'],
        swiftCode: request["swiftCode"],
        currency: request["currency"],
        subMerchantKey: request['subMerchantKey'],
        identityNumber: request['identityNumber'],
        taxNumber: request['taxNumber']
    });
}

util.inherits(UpdateSubMerchantRequest, BaseRequest);

module.exports = UpdateSubMerchantRequest;