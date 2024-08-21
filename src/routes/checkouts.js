import moment from "moment";
import Iyzipay from "iyzipay";
import Carts from "../db/cart";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";
import * as Checkout from "../services/iyzico/methods/checkouts";
import * as Cards from "../services/iyzico/methods/cards";
import id from "../utils/uuid";
import { CompletePayment } from "../utils/payments";
import OrderCompleteMail from "../middlewares/OrderCompleteMail";

export default (router) => {
  //Checkout from complete payment

  router.post("/checkout/complete/payment", async (req, res) => {
    let result = await Checkout.getForPayment({
      locale: "tr",
      conversationId: id(),
      token: req.body.token,
    });
    await CompletePayment(result);
    res.json(result);
  });

  //CHECKOUT FORM İNİTİALİZE
  router.post(
    "/checkout/:cartId",
    Session,
    async (req, res, next) => {
      if (!req.user?.cardUserKey) {
        throw new ApiError(
          "No registered card available",
          400,
          "cardUserKeyRequired"
        );
      }

      if (!req.params?.cartId) {
        throw new ApiError("CartID is required", 400, "cartIdRequired");
      }
      const cart = await Carts.findOne({ _id: req.params?.cartId })
        .populate("buyer")
        .populate("products");
      if (!cart) {
        throw new ApiError("Card not found", 404, "cardNotFound");
      }
      if (cart?.completed) {
        throw new ApiError("Cart is completed", 400, "cartCompleted");
      }

      const paidPrice = cart.products
        .map((product) => product.price)
        .reduce((a, b) => a + b, 0); //ödenecek miktarların toplamı

      const data = {
        locale: req.user.locale,
        conversationId: id(),
        price: paidPrice,
        paidPrice: paidPrice,
        currency: Iyzipay.CURRENCY.TRY,
        installments: "1",
        basketId: String(cart?._id),
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        enabledInstallments: [1, 2, 3, 4, 6, 9],
        callbackUrl: `${process.env.END_POINT}/checkout/complete/payment`,
        ...(req.user?.cardUserKey && {
          cardUserKey: req.user?.cardUserKey,
        }),
        buyer: {
          id: String(req.user._id),
          name: req.user?.name,
          surname: req.user?.surname,
          gsmNumber: req.user?.phoneNumber,
          email: req.user?.email,
          identityNumber: req.user?.identityNumber,
          lastLoginDate: moment(req.user?.updatedAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ), //iyizpay tarih formatına çevirmek için yapıldı
          registrationDate: moment(req.user?.updatedAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          registrationAddress: req.user?.address,
          ip: req.user?.ip,
          city: req.user?.city,
          country: req.user?.country,
          zipCode: req.user?.zipCode,
        },
        shippingAddress: {
          contactName: req.user?.name + "" + req.user?.surname,
          city: req.user?.city,
          country: req.user?.country,
          address: req.user?.address,
          zipCode: req.user?.zipCode,
        },
        billingAddress: {
          contactName: req.user?.name + "" + req.user?.surname,
          city: req.user?.city,
          country: req.user?.country,
          address: req.user?.address,
          zipCode: req.user?.zipCode,
        },
        basketItems: cart.products.map((product, index) => {
          return {
            id: String(product?._id),
            name: product?.name,
            category1: product.categories[0],
            category2: product.categories[1],
            itemType: Iyzipay.BASKET_ITEM_TYPE[product?.itemType],
            price: product?.price,
          };
        }),
      };

      try {
        let result = await Checkout.initialize(data);
        const html = `<!DOCTYPE html>
    <html>
    <head>
    <title>Ödeme yap</title>
    <meta charset="UTF-8"/>
    ${result?.checkoutFormContent}
    </head>
    </html>`;
        res.send(html);
        next();
      } catch (error) {
        next(error);
      }
    },
    OrderCompleteMail,
    (req, res) => {
      return res
        .status(200)
        .json(`${req.user.email} mail adresine sipariş detayı gönderilmiştir.`);
    }
  );
};
