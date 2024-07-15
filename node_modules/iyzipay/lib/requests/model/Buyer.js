'use strict';

function Buyer() {
}

Buyer.body = function (data) {

    return typeof data !== 'undefined' ? {
        id: data["id"],
        name: data["name"],
        surname: data["surname"],
        identityNumber: data["identityNumber"],
        email: data["email"],
        gsmNumber: data["gsmNumber"],
        registrationDate: data["registrationDate"],
        lastLoginDate: data["lastLoginDate"],
        registrationAddress: data["registrationAddress"],
        city: data["city"],
        country: data["country"],
        zipCode: data["zipCode"],
        ip: data["ip"]
    } : undefined
};

module.exports = Buyer;