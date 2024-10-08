import { Types } from "mongoose";
import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";
import * as CancelPayments from "../services/iyzico/methods/cancel_payments";
import id from "../utils/uuid";
import PaymentSuccess from "../db/payment-success";
import Cart from "../db/cart"; // Cart modelini ekledik
import Products from "../db/products";
import sendCanceledOrderMail from "../middlewares/OrderCanceledMail";

const { ObjectId } = Types;

const reasonEnum = ["double_payment", "buyer_request", "fraud", "other"];

export default (router) => {
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
        // PaymentSuccess kaydını bul ve cartId ile populate et
        const payment = await PaymentSuccess.findOne({
          _id: new ObjectId(paymentSuccessId),
        }).populate("cartId");

        if (!payment) {
          throw new ApiError(
            "Payment record not found",
            404,
            "paymentNotFound"
          );
        }

        const now = new Date();
        const paymentDate = new Date(payment.createdAt);
        const timeDifference = now - paymentDate;

        // 24 saat sınırı kontrolü
        if (timeDifference > 86400000) {
          throw new ApiError(
            "This payment can no longer be canceled as the 24-hour window has passed",
            400,
            "cancelTimeExceeded"
          );
        }

        // Ödemeyi iptal et
        const result = await CancelPayments.cancelPayment({
          locale: req.user.locale,
          conversationId: id(),
          paymentId: payment?.paymentId,
          ip: req.user?.ip,
          ...reasonObj,
        });

        // Cart tablosundan ürün bilgilerini al
        const cart = await Cart.findOne({ _id: payment.cartId });
        if (!cart) {
          throw new ApiError("Cart not found", 404, "cartNotFound");
        }

        const productStockUpdates = {};

        // Sepetteki ürünleri işle ve quantity miktarlarını al
        for (const cartProduct of cart.products) {
          const productId = String(cartProduct.productId); // Ürün ID'si
          const quantity = cartProduct.quantity; // Sepetteki miktar

          // Eğer quantity tanımlı değilse bu ürünü atla
          if (!quantity) {
            console.warn(`Quantity is undefined for productId: ${productId}`);
            continue;
          }

          // Ürün ID'sine göre kaç adet olduğunu hesapla
          if (productStockUpdates[productId]) {
            productStockUpdates[productId] += quantity;
          } else {
            productStockUpdates[productId] = quantity;
          }
        }

        // Ürün stoklarını güncelle
        for (const productId in productStockUpdates) {
          const quantityToIncrease = productStockUpdates[productId];

          // quantityToIncrease undefined ise stok güncellemesini yapma
          if (typeof quantityToIncrease === "undefined") {
            console.warn(
              `quantityToIncrease is undefined for productId: ${productId}`
            );
            continue;
          }

          await Products.updateOne(
            { _id: productId },
            { $inc: { stock: quantityToIncrease } } // Stok miktarını artır
          );
        }

        res.json(result);
      } catch (error) {
        next(error);
      }
    },
    sendCanceledOrderMail, // İptal edilen sipariş için e-posta gönder
    (req, res) => {
      return res
        .status(200)
        .json(`Sipariş iptali mail adresine gönderilmiştir.`);
    }
  );
};
