var should = require("should"),
  assert = require("assert"),
  Iyzipay = require("../lib/Iyzipay"),
  options = require("./data/options");

describe("Iyzipay refund to Balance API Test", function() {
  var iyzipay;

  before(function(done) {
    iyzipay = new Iyzipay(options);
    done();
  });

  describe("refund to Balance", function() {
    it("refund to Balance init api test", function(done) {
      var request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        paymentId: 700000102,
        callbackUrl: 'https://merchantwebsite.com',
      };
      iyzipay.refundToBalance.create(request, function(err, result) {
        console.log(err, result);
        done();
      });
    });
  });
});
