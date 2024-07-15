'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    Payment = require('./model/Payment');

function CreatePaymentRequest(request) {

    BaseRequest.call(this, Payment.body(request));
}

util.inherits(CreatePaymentRequest, BaseRequest);

module.exports = CreatePaymentRequest;