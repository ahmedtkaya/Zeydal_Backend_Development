import { Types } from "mongoose";
import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";
import * as CancelPayments from "../services/iyzico/methods/cancel_payments";
import id from "../utils/uuid";
import PaymentSuccess from "../db/payment-success";
import sendCanceledOrderMail from "../middlewares/OrderCanceledMail";

const { ObjectId } = Types;

const reasonEnum = ["double_payment", "buyer_request", "fraud", "other"];

export default (router) => {
  //bu işlemi ya kaldır ya da 24 saat sınırı koy
  router.post(
    "/payments/:paymentSuccessId/cancel",
    Session,
    async (req, res, next) => {
      const { reason, description } = req.body;
      const paymentSuccessId = req.params.paymentSuccessId;
      const reasonObj = {};

      if (!paymentSuccessId) {
        throw new ApiError(
          "Payment Success id is required",
          400,
          "paymentSuccessIdRequired"
        );
      }
      if (reason && description) {
        if (!reasonEnum.includes(reason)) {
          throw new ApiError(
            "Invalid cancel payment reason",
            400,
            "invalidCancelPaymentReason"
          );
        }
        reasonObj.reason = reason;
        reasonObj.description = description;
      }
      try {
        const payment = await PaymentSuccess.findOne({
          _id: new ObjectId(paymentSuccessId),
        });

        const now = new Date();
        const paymentDate = new Date(payment.createdAt);
        const timeDifference = now - paymentDate;

        // 24 saat 86400000 milisaniyeye denk gelir
        if (timeDifference > 86400000) {
          throw new ApiError(
            "This payment can no longer be canceled as the 24-hour window has passed",
            400,
            "cancelTimeExceeded"
          );
        }

        const result = await CancelPayments.cancelPayment({
          locale: req.user.locale,
          conversationId: id(),
          paymentId: payment?.paymentId,
          ip: req.user?.ip,
          ...reasonObj,
        });
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
    sendCanceledOrderMail,
    (req, res) => {
      return res
        .status(200)
        .json(`sipariş iptali mail adresine gönderilmiştir.`);
    }
  );
};
