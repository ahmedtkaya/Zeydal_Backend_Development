'use strict';

var SubscriptionAddress = require('./SubscriptionAddress');

function SubscriptionCustomer() {
}

SubscriptionCustomer.body = function (data) {
    return typeof data !== 'undefined' ? {
        name: data['name'],
        surname: data['surname'],
        identityNumber: data['identityNumber'],
        email: data['email'],
        gsmNumber: data['gsmNumber'],
        billingAddress: SubscriptionAddress.body(data['billingAddress']),
        shippingAddress: SubscriptionAddress.body(data['shippingAddress'])
    } : undefined;
};

module.exports = SubscriptionCustomer;
