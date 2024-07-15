'use strict';

function Request(request) {
    this._request = request;
    this.toString();
}

Request.prototype.toJson = function () {
    return this._request;
};

Request.prototype.toPkiString = function () {
    return this._generateRequestString(this._request);
};

Request.prototype._generateRequestString = function (request) {
    var isArray = Array.isArray(request);
    var requestString = '[';
    for (var i in request) {
        var val = request[i];
        if (typeof val !== 'undefined' && typeof val !== 'function') {
            // Eliminate number keys of array elements
            if (!isArray) {
                requestString += i + '=';
            }
            if (typeof val === 'object') {
                requestString += this._generateRequestString(val);
            } else {
                requestString += val;
            }
            requestString += isArray ? ', ' : ',';
        }
    }
    requestString = requestString.slice(0, (isArray ? -2 : -1));
    requestString += ']';
    return requestString;
};

module.exports = Request;

