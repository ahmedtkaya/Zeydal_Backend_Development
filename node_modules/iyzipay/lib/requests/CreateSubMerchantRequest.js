'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util');

function CreateSubMerchantRequest(request) {

    BaseRequest.call(this, {
        locale: request["locale"],
        conversationId: request["conversationId"],
        name: request["name"],
        email: request["email"],
        gsmNumber: request["gsmNumber"],
        address: request["address"],
        iban: request["iban"],
        taxOffice: request["taxOffice"],
        contactName: request["contactName"],
        contactSurname: request["contactSurname"],
        legalCompanyTitle: request["legalCompanyTitle"],
        swiftCode: request["swiftCode"],
        currency: request["currency"],
        subMerchantExternalId: request["subMerchantExternalId"],
        identityNumber: request["identityNumber"],
        taxNumber: request["taxNumber"],
        subMerchantType: request["subMerchantType"]
    });
}

util.inherits(CreateSubMerchantRequest, BaseRequest);

module.exports = CreateSubMerchantRequest;