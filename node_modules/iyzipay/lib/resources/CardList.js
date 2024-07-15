'use strict';

var IyzipayResource = require('../IyzipayResource');

function CardList() {
    this._config = arguments[0];
    this._api = {
        retrieve: {
            path: '/cardstorage/cards',
            method: 'POST',
            requestModel: 'RetrieveCardListRequest'
        }
    };
}

CardList.prototype = new IyzipayResource();

module.exports = CardList;