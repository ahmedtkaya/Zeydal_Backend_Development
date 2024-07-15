'use strict';

function Address() {
}

Address.body = function (data) {

    return typeof data !== 'undefined' ? {
        address: data["address"],
        zipCode: data["zipCode"],
        contactName: data["contactName"],
        city: data["city"],
        country: data["country"]
    } : undefined
};

module.exports = Address;