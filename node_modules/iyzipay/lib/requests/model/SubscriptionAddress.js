'use strict';

function SubscriptionAddress() {
}

SubscriptionAddress.body = function (data) {

    return typeof data !== 'undefined' ? {
      address: data["address"],
      zipCode: data["zipCode"],
      contactName: data["contactName"],
      city: data["city"],
      country: data["country"],
      district: data["district"],
    } : undefined
};

module.exports = SubscriptionAddress;