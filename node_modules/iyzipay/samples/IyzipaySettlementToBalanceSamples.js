var should = require("should"),
  assert = require("assert"),
  Iyzipay = require("../lib/Iyzipay"),
  options = require("./data/options");

describe("Iyzipay Settlement to Balance API Test", function() {
  var iyzipay;

  before(function(done) {
    iyzipay = new Iyzipay(options);
    done();
  });

  describe("Settlement to Balance", function() {
    it("Settlement to Balance init api test", function(done) {
      var request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '1234567ewqeds89',
        subMerchantKey: 'y9ILqfwR8WQ9w+m9tGyUY4NsCVU=',
        callbackUrl: 'https://merchantwebsite.com',
        price: 1.2
      };
      iyzipay.settlementToBalance.create(request, function(err, result) {
        console.log(err, result);
        done();
      });
    });
  });
});
