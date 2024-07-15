'use strict';

var IyzipayResource = require('../IyzipayResource');

function Card() {
    this._config = arguments[0];
    this._api = {
        create: {
            path: '/cardstorage/card',
            method: 'POST',
            requestModel: 'CreateCardRequest'
        },
        delete: {
            path: '/cardstorage/card',
            method: 'DELETE',
            requestModel: 'DeleteCardRequest'
        }
    };
}

Card.prototype = new IyzipayResource();

module.exports = Card;