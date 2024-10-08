import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";
import * as RefundPayments from "../services/iyzico/methods/refund_payments";
import id from "../utils/uuid";
import Iyzipay from "iyzipay";
import PaymentSuccess from "../db/payment-success";

const reasonEnum = ["double_payment", "buyer_request", "fraud", "other"];

export default (router) => {
  router.post(
    "/payments/:paymentTransactionId/refund",
    Session,
    async (req, res) => {
      const { paymentTransactionId } = req.params;
      const reasonObj = {};
      const { reason, description } = req.body;
      if (!paymentTransactionId) {
        throw new ApiError(
          "PaymentTransactionId is required",
          400,
          "paymentTransactionRequired"
        );
      }

      if (reason && description) {
        if (!reasonEnum.includes(reason)) {
          throw new ApiError(
            "Invalid canlcel payment reason",
            400,
            "invalidCancelPaymentReason"
          );
        }
        reasonObj.reason = reason;
        reasonObj.description = description;
      }

      const payment = await PaymentSuccess.findOne({
        "itemTransactions.paymentTransactionId": paymentTransactionId,
      });
      //saat sınırı koy kısmi iptal için

      const currentItemTransaction = payment.itemTransactions.find(
        (itemTransaction, index) => {
          return itemTransaction.paymentTransactionId === paymentTransactionId;
        }
      );
      const result = await RefundPayments.refundPayment({
        locale: req.user?.locale,
        conversationId: id(),
        paymentTransactionId: currentItemTransaction?.paymentTransactionId,
        price: req.body?.refundPrice || currentItemTransaction?.paidPrice,
        currency: Iyzipay.CURRENCY.TRY,
        ip: req.user?.ip,
        ...reasonObj,
      });
      res.json(result);
    }
  );
};
