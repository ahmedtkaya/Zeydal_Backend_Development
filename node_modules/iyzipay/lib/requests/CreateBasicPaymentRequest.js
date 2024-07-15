'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    BasicPayment = require('./model/BasicPayment');

function CreateBasicPaymentRequest(request) {

    BaseRequest.call(this, BasicPayment.body(request));
}

util.inherits(CreateBasicPaymentRequest, BaseRequest);

module.exports = CreateBasicPaymentRequest;