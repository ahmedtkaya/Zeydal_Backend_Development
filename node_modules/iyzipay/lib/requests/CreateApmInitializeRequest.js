'use strict';

var BaseRequest = require('./BaseRequest'),
    util = require('util'),
    Apm = require('./model/Apm');

function CreateApmInitializeRequest(request) {

    BaseRequest.call(this, Apm.body(request));
}

util.inherits(CreateApmInitializeRequest, BaseRequest);

module.exports = CreateApmInitializeRequest;