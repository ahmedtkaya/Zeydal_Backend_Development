import moment from "moment";
import Iyzipay from "iyzipay";
import Carts from "../db/cart";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";
import * as Payments from "../services/iyzico/methods/payments";
import * as Cards from "../services/iyzico/methods/cards";
import id from "../utils/uuid";
import { CompletePayment } from "../utils/payments";

export default (router) => {
  //yeni bir kartla ödeme oluştur ve kartı kaydetme
  router.post("/payments/:cartId/with-new-card", Session, async (req, res) => {
    const { card } = req.body;
    if (!card) {
      throw new ApiError("Card is required", 400, "cardRequired");
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

    card.registerCard = "0"; //methodslarda registerCard:1 yani kartı kaydet demek ama şuan kaydetme dediğim için 0 yaptım

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
      paymentCard: card,
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

    let result = await Payments.createPayment(data);
    await CompletePayment(result);
    res.json(result);
  });

  //yeni bir ödeme oluştur ve kart kaydet
  router.post(
    "/payments/:cartId/with-new-card/register-card",
    Session,
    async (req, res) => {
      const { card } = req.body;
      if (!card) {
        throw new ApiError("Card is required", 400, "cardRequired");
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

      if (req.user?.cardUserKey) {
        card.cardUserKey = req.user?.cardUserKey;
      }
      card.registerCard = "1"; //methodslarda registerCard:1 yani kartı kaydet

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
        paymentCard: card,
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

      let result = await Payments.createPayment(data);
      if (req.user?.cardUserKey) {
        const user = await Users.findOne({ _id: req.user?._id });
        user.cardUserKey = result?.cardUserKey;
        await user.save();
      }
      await CompletePayment(result);
      res.json(result);
    }
  );

  //hali hazırda bulunan kart ile ödeme
  router.post(
    "/payments/:cartId/:cardIndex/with-registered-card-index",
    Session,
    async (req, res) => {
      let { cardIndex } = req.params;
      if (!cardIndex) {
        throw new ApiError("Card index is required", 400, "cardIndexRequired");
      }
      if (!req.user?.cardUserKey) {
        throw new ApiError(
          "No registered card available",
          400,
          "cardUserKeyRequired"
        );
      }

      const cards = await Cards.getUserCards({
        locale: req.user.locale,
        conversationId: id(),
        cardUserKey: req.user?.cardUserKey,
      });
      const index = parseInt(cardIndex);
      if (index >= cards?.cardDetails?.length) {
        throw new ApiError("Card does not exist", 400, "cardIndexInvalid");
      }
      const { cardToken } = cards?.cardDetails[index];
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

      const card = {
        cardToken,
        cardUserKey: req.user?.cardUserKey,
      };

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
        paymentCard: card,
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

      let result = await Payments.createPayment(data);
      await CompletePayment(result);
      res.json(result);
    }
  );

  router.post(
    "/payments/:cartId/with-registered-card-token",
    Session,
    async (req, res) => {
      let { cardToken } = req.body;
      if (!cardToken) {
        throw new ApiError("Card Token is required", 400, "cardTokenRequired");
      }
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

      const card = {
        cardToken,
        cardUserKey: req.user?.cardUserKey,
      };

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
        paymentCard: card,
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

      let result = await Payments.createPayment(data);
      await CompletePayment(result);
      res.json(result);
    }
  );
};
