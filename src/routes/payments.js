import moment from "moment";
import Iyzipay from "iyzipay";
import Carts from "../db/cart";
import Users from "../db/users";
import Products from "../db/products";
import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";
import * as Payments from "../services/iyzico/methods/payments";
import * as Cards from "../services/iyzico/methods/cards";
import id from "../utils/uuid";
import { CompletePayment } from "../utils/payments";
import OrderCompleteMail from "../middlewares/OrderCompleteMail";

export default (router) => {
  //yeni bir kartla ödeme oluştur ve kartı kaydetme
  // router.post(
  //   "/payments/:cartId/with-new-card",
  //   Session,
  //   async (req, res, next) => {
  //     const { card } = req.body;
  //     if (!card) {
  //       throw new ApiError("Card is required", 400, "cardRequired");
  //     }
  //     if (!req.params?.cartId) {
  //       throw new ApiError("CartID is required", 400, "cartIdRequired");
  //     }
  //     const cart = await Carts.findOne({ _id: req.params?.cartId })
  //       .populate("buyer")
  //       .populate("products");
  //     if (!cart) {
  //       throw new ApiError("Card not found", 404, "cardNotFound");
  //     }
  //     if (cart?.completed) {
  //       throw new ApiError("Cart is completed", 400, "cartCompleted");
  //     }

  //     card.registerCard = "0"; //methodslarda registerCard:1 yani kartı kaydet demek ama şuan kaydetme dediğim için 0 yaptım

  //     const paidPrice = cart.products
  //       .map((product) => product.price)
  //       .reduce((a, b) => a + b, 0); //ödenecek miktarların toplamı

  //     const data = {
  //       locale: req.user.locale,
  //       conversationId: id(),
  //       price: paidPrice,
  //       paidPrice: paidPrice,
  //       currency: Iyzipay.CURRENCY.TRY,
  //       installments: "1",
  //       basketId: String(cart?._id),
  //       paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
  //       paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
  //       paymentCard: card,
  //       buyer: {
  //         id: String(req.user._id),
  //         name: req.user?.name,
  //         surname: req.user?.surname,
  //         gsmNumber: req.user?.phoneNumber,
  //         email: req.user?.email,
  //         identityNumber: req.user?.identityNumber,
  //         lastLoginDate: moment(req.user?.updatedAt).format(
  //           "YYYY-MM-DD HH:mm:ss"
  //         ), //iyizpay tarih formatına çevirmek için yapıldı
  //         registrationDate: moment(req.user?.updatedAt).format(
  //           "YYYY-MM-DD HH:mm:ss"
  //         ),
  //         registrationAddress: req.user?.address,
  //         ip: req.user?.ip,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         zipCode: req.user?.zipCode,
  //       },
  //       shippingAddress: {
  //         contactName: req.user?.name + "" + req.user?.surname,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         address: req.user?.address,
  //         zipCode: req.user?.zipCode,
  //       },
  //       billingAddress: {
  //         contactName: req.user?.name + "" + req.user?.surname,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         address: req.user?.address,
  //         zipCode: req.user?.zipCode,
  //       },
  //       basketItems: cart.products.map((product, index) => {
  //         return {
  //           id: String(product?._id),
  //           name: product?.name,
  //           category1: product.categories[0],
  //           category2: product.categories[1],
  //           itemType: Iyzipay.BASKET_ITEM_TYPE[product?.itemType],
  //           price: product?.price,
  //         };
  //       }),
  //     };

  //     try {
  //       let result = await Payments.createPayment(data);
  //       await CompletePayment(result);
  //       // Ürün stoklarını güncelleme
  //       const productStockUpdates = {};

  //       // Sepetteki ürünleri döngüyle işleyerek aynı ürünlerden kaç tane olduğunu hesapla
  //       for (const cartProduct of cart.products) {
  //         const productId = String(cartProduct._id);
  //         if (productStockUpdates[productId]) {
  //           productStockUpdates[productId]++;
  //         } else {
  //           productStockUpdates[productId] = 1;
  //         }
  //       }

  //       // Stokları güncelle
  //       for (const productId in productStockUpdates) {
  //         const quantityToDecrease = productStockUpdates[productId];
  //         await Products.updateOne(
  //           { _id: productId },
  //           { $inc: { stock: -quantityToDecrease } }
  //         );
  //       }
  //       res.json(result);

  //       next();
  //     } catch (error) {
  //       next(error);
  //     }
  //   },
  //   OrderCompleteMail,
  //   (req, res) => {
  //     return res
  //       .status(200)
  //       .json(`${req.user.email} mail adresine sipariş detayı gönderilmiştir.`);
  //   }
  // ); //burada hata alıyordum bunu birdaha test et
  router.post(
    "/payments/:cartId/with-new-card",
    Session,
    async (req, res, next) => {
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
        throw new ApiError("Cart not found", 404, "cartNotFound");
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
          ),
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
          contactName: req.user?.name + " " + req.user?.surname,
          city: req.user?.city,
          country: req.user?.country,
          address: req.user?.address,
          zipCode: req.user?.zipCode,
        },
        billingAddress: {
          contactName: req.user?.name + " " + req.user?.surname,
          city: req.user?.city,
          country: req.user?.country,
          address: req.user?.address,
          zipCode: req.user?.zipCode,
        },
        basketItems: cart.products.map((product, index) => {
          return {
            id: String(product?._id),
            name: product?.name,
            category1: product?.categories?.[0] || "Uncategorized", // Eğer categories yoksa "Uncategorized" döner
            category2: product?.categories?.[1] || "", // Eğer ikinci kategori yoksa boş string döner
            itemType: Iyzipay.BASKET_ITEM_TYPE[product?.itemType],
            price: product?.price,
          };
        }),
      };

      try {
        let result = await Payments.createPayment(data);
        await CompletePayment(result);

        // Ürün stoklarını güncelleme
        const productStockUpdates = {};

        // Sepetteki ürünleri döngüyle işleyerek aynı ürünlerden kaç tane olduğunu hesapla
        for (const cartProduct of cart.products) {
          const productId = String(cartProduct._id);
          if (productStockUpdates[productId]) {
            productStockUpdates[productId]++;
          } else {
            productStockUpdates[productId] = 1;
          }
        }

        // Stokları güncelle
        for (const productId in productStockUpdates) {
          const quantityToDecrease = productStockUpdates[productId];
          await Products.updateOne(
            { _id: productId },
            { $inc: { stock: -quantityToDecrease } }
          );
        }
        res.json(result);

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
  // router.post(
  //   "/payments/:cartId/:cardIndex/with-registered-card-index",
  //   Session,
  //   async (req, res, next) => {
  //     let { cardIndex } = req.params;
  //     if (!cardIndex) {
  //       throw new ApiError("Card index is required", 400, "cardIndexRequired");
  //     }
  //     if (!req.user?.cardUserKey) {
  //       throw new ApiError(
  //         "No registered card available",
  //         400,
  //         "cardUserKeyRequired"
  //       );
  //     }

  //     const cards = await Cards.getUserCards({
  //       locale: req.user.locale,
  //       conversationId: id(),
  //       cardUserKey: req.user?.cardUserKey,
  //     });
  //     const index = parseInt(cardIndex);
  //     if (index >= cards?.cardDetails?.length) {
  //       throw new ApiError("Card does not exist", 400, "cardIndexInvalid");
  //     }
  //     const { cardToken } = cards?.cardDetails[index];
  //     if (!req.params?.cartId) {
  //       throw new ApiError("CartID is required", 400, "cartIdRequired");
  //     }
  //     const cart = await Carts.findOne({ _id: req.params?.cartId })
  //       .populate("buyer")
  //       .populate("products");
  //     if (!cart) {
  //       throw new ApiError("Card not found", 404, "cardNotFound");
  //     }
  //     if (cart?.completed) {
  //       throw new ApiError("Cart is completed", 400, "cartCompleted");
  //     }

  //     const paidPrice = cart.products
  //       .map((product) => product.price)
  //       .reduce((a, b) => a + b, 0); //ödenecek miktarların toplamı

  //     const card = {
  //       cardToken,
  //       cardUserKey: req.user?.cardUserKey,
  //     };

  //     const data = {
  //       locale: req.user.locale,
  //       conversationId: id(),
  //       price: paidPrice,
  //       paidPrice: paidPrice,
  //       currency: Iyzipay.CURRENCY.TRY,
  //       installments: "1",
  //       basketId: String(cart?._id),
  //       paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
  //       paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
  //       paymentCard: card,
  //       buyer: {
  //         id: String(req.user._id),
  //         name: req.user?.name,
  //         surname: req.user?.surname,
  //         gsmNumber: req.user?.phoneNumber,
  //         email: req.user?.email,
  //         identityNumber: req.user?.identityNumber,
  //         lastLoginDate: moment(req.user?.updatedAt).format(
  //           "YYYY-MM-DD HH:mm:ss"
  //         ), //iyizpay tarih formatına çevirmek için yapıldı
  //         registrationDate: moment(req.user?.updatedAt).format(
  //           "YYYY-MM-DD HH:mm:ss"
  //         ),
  //         registrationAddress: req.user?.address,
  //         ip: req.user?.ip,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         zipCode: req.user?.zipCode,
  //       },
  //       shippingAddress: {
  //         contactName: req.user?.name + "" + req.user?.surname,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         address: req.user?.address,
  //         zipCode: req.user?.zipCode,
  //       },
  //       billingAddress: {
  //         contactName: req.user?.name + "" + req.user?.surname,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         address: req.user?.address,
  //         zipCode: req.user?.zipCode,
  //       },
  //       basketItems: cart.products.map((product, index) => {
  //         return {
  //           id: String(product?._id),
  //           name: product?.name,
  //           category1: product.categories[0],
  //           category2: product.categories[1],
  //           itemType: Iyzipay.BASKET_ITEM_TYPE[product?.itemType],
  //           price: product?.price,
  //         };
  //       }),
  //     };

  //     try {
  //       let result = await Payments.createPayment(data);
  //       await CompletePayment(result);

  //       // Ürün stoklarını güncelleme
  //       const productStockUpdates = {};

  //       // Sepetteki ürünleri döngüyle işleyerek aynı ürünlerden kaç tane olduğunu hesapla
  //       for (const cartProduct of cart.products) {
  //         const productId = String(cartProduct._id);
  //         if (productStockUpdates[productId]) {
  //           productStockUpdates[productId]++;
  //         } else {
  //           productStockUpdates[productId] = 1;
  //         }
  //       }

  //       // Stokları güncelle
  //       for (const productId in productStockUpdates) {
  //         const quantityToDecrease = productStockUpdates[productId];
  //         await Products.updateOne(
  //           { _id: productId },
  //           { $inc: { stock: -quantityToDecrease } }
  //         );
  //       }
  //       res.json(result);

  //       next();
  //     } catch (error) {
  //       next(error);
  //     }
  //   },
  //   OrderCompleteMail,
  //   (req, res) => {
  //     return res
  //       .status(200)
  //       .json(`${req.user.email} mail adresine sipariş detayı gönderilmiştir.`);
  //   }
  // );
  //en son buydu
  // router.post(
  //   "/payments/:cartId/:cardIndex/with-registered-card-index",
  //   Session,
  //   async (req, res, next) => {
  //     let { cardIndex } = req.params;
  //     if (!cardIndex) {
  //       throw new ApiError("Card index is required", 400, "cardIndexRequired");
  //     }
  //     if (!req.user?.cardUserKey) {
  //       throw new ApiError(
  //         "No registered card available",
  //         400,
  //         "cardUserKeyRequired"
  //       );
  //     }

  //     const cards = await Cards.getUserCards({
  //       locale: req.user.locale,
  //       conversationId: id(),
  //       cardUserKey: req.user?.cardUserKey,
  //     });
  //     const index = parseInt(cardIndex);
  //     if (index >= cards?.cardDetails?.length) {
  //       throw new ApiError("Card does not exist", 400, "cardIndexInvalid");
  //     }
  //     const { cardToken } = cards?.cardDetails[index];
  //     if (!req.params?.cartId) {
  //       throw new ApiError("CartID is required", 400, "cartIdRequired");
  //     }

  //     // Cart'ı bul
  //     const cart = await Carts.findOne({ _id: req.params?.cartId }).populate(
  //       "buyer"
  //     ); // Sadece buyer'ı populate ediyoruz.

  //     if (!cart) {
  //       throw new ApiError("Cart not found", 404, "cartNotFound");
  //     }
  //     if (cart?.completed) {
  //       throw new ApiError("Cart is completed", 400, "cartCompleted");
  //     }

  //     // Ürün bilgilerini getirme (Cart'taki productId'leri kullanarak)
  //     const productIds = cart.products.map((item) => item.productId);
  //     const products = await Products.find({ _id: { $in: productIds } });

  //     // Ürün bilgilerini cart'a ekliyoruz
  //     const enrichedProducts = cart.products.map((cartProduct) => {
  //       const productDetail = products.find(
  //         (product) => String(product._id) === String(cartProduct.productId)
  //       );
  //       return {
  //         ...cartProduct._doc,
  //         productDetail,
  //       };
  //     });

  //     const paidPrice = enrichedProducts
  //       .map((product) => product.productDetail.price * product.quantity)
  //       .reduce((a, b) => a + b, 0); // Ödenecek miktarların toplamı

  //     const card = {
  //       cardToken,
  //       cardUserKey: req.user?.cardUserKey,
  //     };

  //     const data = {
  //       locale: req.user.locale,
  //       conversationId: id(),
  //       price: paidPrice,
  //       paidPrice: paidPrice,
  //       currency: Iyzipay.CURRENCY.TRY,
  //       installments: "1",
  //       basketId: String(cart?._id),
  //       paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
  //       paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
  //       paymentCard: card,
  //       buyer: {
  //         id: String(req.user._id),
  //         name: req.user?.name,
  //         surname: req.user?.surname,
  //         gsmNumber: req.user?.phoneNumber,
  //         email: req.user?.email,
  //         identityNumber: req.user?.identityNumber,
  //         lastLoginDate: moment(req.user?.updatedAt).format(
  //           "YYYY-MM-DD HH:mm:ss"
  //         ),
  //         registrationDate: moment(req.user?.updatedAt).format(
  //           "YYYY-MM-DD HH:mm:ss"
  //         ),
  //         registrationAddress: req.user?.address,
  //         ip: req.user?.ip,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         zipCode: req.user?.zipCode,
  //       },
  //       shippingAddress: {
  //         contactName: req.user?.name + "" + req.user?.surname,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         address: req.user?.address,
  //         zipCode: req.user?.zipCode,
  //       },
  //       billingAddress: {
  //         contactName: req.user?.name + "" + req.user?.surname,
  //         city: req.user?.city,
  //         country: req.user?.country,
  //         address: req.user?.address,
  //         zipCode: req.user?.zipCode,
  //       },
  //       basketItems: enrichedProducts.map((cartProduct, index) => {
  //         const product = cartProduct.productDetail;
  //         return {
  //           id: String(product?._id),
  //           name: product?.name,
  //           category1: product?.categories?.[0] || "Uncategorized",
  //           category2: product?.categories?.[1] || "",
  //           itemType: Iyzipay.BASKET_ITEM_TYPE[product?.itemType],
  //           price: product?.price,
  //         };
  //       }),
  //     };

  //     try {
  //       let result = await Payments.createPayment(data);
  //       await CompletePayment(result);

  //       // Ürün stoklarını güncelleme
  //       const productStockUpdates = {};

  //       // Sepetteki ürünleri döngüyle işleyerek aynı ürünlerden kaç tane olduğunu hesapla
  //       for (const cartProduct of cart.products) {
  //         const productId = String(cartProduct._id);
  //         if (productStockUpdates[productId]) {
  //           productStockUpdates[productId]++;
  //         } else {
  //           productStockUpdates[productId] = 1;
  //         }
  //       }

  //       // Stokları güncelle
  //       for (const productId in productStockUpdates) {
  //         const quantityToDecrease = productStockUpdates[productId];
  //         await Products.updateOne(
  //           { _id: productId },
  //           { $inc: { stock: -quantityToDecrease } }
  //         );
  //       }

  //       res.json(result);
  //       next();
  //     } catch (error) {
  //       next(error);
  //     }
  //   },
  //   OrderCompleteMail,
  //   (req, res) => {
  //     return res
  //       .status(200)
  //       .json(`${req.user.email} mail adresine sipariş detayı gönderilmiştir.`);
  //   }
  // );

  router.post(
    "/payments/:cartId/:cardIndex/with-registered-card-index",
    Session,
    async (req, res, next) => {
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

      // Cart'ı bul
      const cart = await Carts.findOne({ _id: req.params?.cartId }).populate(
        "buyer"
      ); // Sadece buyer'ı populate ediyoruz.

      if (!cart) {
        throw new ApiError("Cart not found", 404, "cartNotFound");
      }
      if (cart?.completed) {
        throw new ApiError("Cart is completed", 400, "cartCompleted");
      }

      // Ürün bilgilerini getirme (Cart'taki productId'leri kullanarak)
      const productIds = cart.products.map((item) => item.productId);
      const products = await Products.find({ _id: { $in: productIds } });

      // Ürün bilgilerini cart'a ekliyoruz
      const enrichedProducts = cart.products.map((cartProduct) => {
        const productDetail = products.find(
          (product) => String(product._id) === String(cartProduct.productId)
        );
        return {
          ...cartProduct._doc,
          productDetail,
        };
      });

      // Ödenecek miktar hesaplama
      const paidPrice = enrichedProducts
        .map((product) => product.productDetail.price * product.quantity)
        .reduce((a, b) => a + b, 0);

      const basketItems = enrichedProducts.map((cartProduct) => {
        const product = cartProduct.productDetail;
        return {
          id: String(product?._id),
          name: product?.name,
          category1: product?.categories?.[0] || "Uncategorized",
          category2: product?.categories?.[1] || "",
          itemType: Iyzipay.BASKET_ITEM_TYPE[product?.itemType],
          price: (product?.price * cartProduct.quantity).toFixed(2), // Birim fiyatı çarpıyoruz ve virgülden sonra 2 basamak tutuyoruz
        };
      });

      // Sepetteki ürünlerin toplam fiyatını hesaplıyoruz
      const basketTotal = basketItems
        .map((item) => parseFloat(item.price)) // Fiyatları alıp float'a çeviriyoruz
        .reduce((a, b) => a + b, 0);

      // Ödeme ve sepet toplamları kontrolü
      if (basketTotal !== paidPrice) {
        throw new ApiError(
          "Gönderilen tutar tüm kırılımların toplam tutarına eşit olmalıdır",
          400,
          "priceMismatch"
        );
      }

      // Ödeme verisi
      const data = {
        locale: req.user.locale,
        conversationId: id(),
        price: basketTotal.toFixed(2), // İyzico için yuvarlanmış toplam sepet tutarı
        paidPrice: basketTotal.toFixed(2), // Aynı değeri paidPrice'a da gönderiyoruz
        currency: Iyzipay.CURRENCY.TRY,
        installments: "1",
        basketId: String(cart?._id),
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        paymentCard: {
          cardToken,
          cardUserKey: req.user?.cardUserKey,
        },
        buyer: {
          id: String(req.user._id),
          name: req.user?.name,
          surname: req.user?.surname,
          gsmNumber: req.user?.phoneNumber,
          email: req.user?.email,
          identityNumber: req.user?.identityNumber,
          lastLoginDate: moment(req.user?.updatedAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          registrationDate: moment(req.user?.createdAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          registrationAddress: req.user?.address,
          ip: req.user?.ip,
          city: req.user?.city,
          country: req.user?.country,
          zipCode: req.user?.zipCode,
        },
        shippingAddress: {
          contactName: req.user?.name + " " + req.user?.surname,
          city: req.user?.city,
          country: req.user?.country,
          address: req.user?.address,
          zipCode: req.user?.zipCode,
        },
        billingAddress: {
          contactName: req.user?.name + " " + req.user?.surname,
          city: req.user?.city,
          country: req.user?.country,
          address: req.user?.address,
          zipCode: req.user?.zipCode,
        },
        basketItems, // Doğru hesaplanan sepet öğelerini gönderiyoruz
      };

      try {
        let result = await Payments.createPayment(data);
        await CompletePayment(result);

        // Ürün stoklarını güncelleme
        const productStockUpdates = {};

        // Sepetteki ürünleri döngüyle işleyerek aynı ürünlerden kaç tane olduğunu hesapla
        for (const cartProduct of cart.products) {
          const productId = String(cartProduct.productId); // Düzeltme: _id yerine productId kullanılıyor
          if (productStockUpdates[productId]) {
            productStockUpdates[productId] += cartProduct.quantity; // Her ürünün quantity'sini ekliyoruz
          } else {
            productStockUpdates[productId] = cartProduct.quantity;
          }
        }

        // Stokları güncelle
        for (const productId in productStockUpdates) {
          const quantityToDecrease = productStockUpdates[productId];
          await Products.updateOne(
            { _id: productId },
            { $inc: { stock: -quantityToDecrease } }
          );
        }

        res.json(result);
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
