import ApiError from "../errors/ApiError";
import mongoose from "mongoose";
import Session from "../middlewares/Session";
import Products from "../db/products";
import Cart from "../db/cart";

export default (router) => {
  // router.post("/carts", Session, async (req, res, next) => {
  //   try {
  //     const { productId } = req.body;

  //     // Ürünün geçerli olup olmadığını kontrol et
  //     const product = await Products.findById(productId);
  //     if (!product) {
  //       throw new ApiError("Product not found", 404, "ProductNotFound");
  //     }

  //     // Kullanıcının mevcut bir sepeti var mı kontrol et (Tamamlanmamış bir sepet)
  //     let cart = await Cart.findOne({
  //       buyer: req.user._id,
  //       completed: false,
  //     });

  //     // Eğer mevcut bir sepet yoksa yeni bir sepet oluştur
  //     if (!cart) {
  //       cart = new Cart({
  //         buyer: new mongoose.Types.ObjectId(req.user._id),
  //       });
  //     }

  //     // Ürünü sepete ekle
  //     cart.products.push(new mongoose.Types.ObjectId(productId));

  //     // Sepeti kaydet
  //     await cart.save();

  //     res.status(200).json({
  //       message: "Product added on cart.",
  //       cart,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     throw new ApiError(
  //       "Cart could not be created",
  //       400,
  //       "cartCreationFailed"
  //     );
  //   }
  // });

  router.post("/carts", Session, async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      // Ürünün geçerli olup olmadığını kontrol et
      const product = await Products.findById(productId);
      if (!product) {
        throw new ApiError("Product not found", 404, "ProductNotFound");
      }

      // Kullanıcının mevcut bir sepeti var mı kontrol et (Tamamlanmamış bir sepet)
      let cart = await Cart.findOne({
        buyer: req.user._id,
        completed: false,
      });

      // Eğer mevcut bir sepet yoksa yeni bir sepet oluştur
      if (!cart) {
        cart = new Cart({
          buyer: new mongoose.Types.ObjectId(req.user._id),
          products: [],
        });
      }

      // Sepette zaten aynı ürün varsa miktarını artır, yoksa yeni ürün olarak ekle
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingProductIndex > -1) {
        // Eğer ürün zaten sepetteyse, miktarı artır
        cart.products[existingProductIndex].quantity += quantity || 1;
      } else {
        // Ürün sepette yoksa yeni ürün olarak ekle
        cart.products.push({
          productId: new mongoose.Types.ObjectId(productId),
          seller: product.seller, // Ürünün satıcısını buraya ekliyoruz
          quantity: quantity || 1, // Gönderilen miktarı kullan veya 1 olarak ayarla
          status: "pending", // Varsayılan olarak ürün durumu 'pending'
        });
      }

      // Sepeti kaydet
      await cart.save();

      res.status(200).json({
        message: "Product added to cart.",
        cart,
      });
    } catch (error) {
      console.error(error);
      next(
        new ApiError("Cart could not be created", 400, "cartCreationFailed")
      );
    }
  });

  router.get("/getCart", Session, async (req, res) => {
    try {
      const cart = await Cart.findOne({
        buyer: req.user._id,
        completed: false,
      })
        .populate("products.productId", "name price images categories")
        .populate("products.seller", "SellerName");

      if (!cart) {
        throw new ApiError("No active Cart found", 401, "cartNotFound");
      }
      res.status(200).json(cart);
    } catch (error) {
      console.log(error);
      throw new ApiError("Could not retrieve cart", 400, "getCartFailed");
    }
  });

  router.post("/delete-product-in-cart/:cartId", Session, async (req, res) => {
    try {
      const { cartId } = req.params;
      const { productId } = req.body;

      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new ApiError("Cart not found", 404, "CartNotFound");
      }

      // Cart'taki product'ların içinde productId'yi arıyoruz
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (productIndex > -1) {
        // Ürünü bulduk, şimdi miktarı kontrol ediyoruz
        if (cart.products[productIndex].quantity > 1) {
          // Eğer miktar 1'den fazlaysa, miktarı azalt
          cart.products[productIndex].quantity -= 1;
        } else {
          // Eğer miktar 1 ise ürünü tamamen sepetten kaldır
          cart.products.splice(productIndex, 1);
        }
      } else {
        throw new ApiError(
          "Product not found in cart",
          404,
          "ProductNotFoundInCart"
        );
      }

      if (cart.products.length === 0) {
        await Cart.findByIdAndDelete(cartId);
        return res
          .status(200)
          .json({ message: "Cart is empty and has been deleted" });
      }

      // Sepeti kaydediyoruz
      await cart.save();

      res.status(200).json({
        message: "Product has been removed or quantity decreased.",
        cart,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Could not delete product from cart",
        error: error.message,
      });
    }
  });

  // router.post("/delete-product-in-cart/:cartId", Session, async (req, res) => {
  //   try {
  //     const { cartId } = req.params;
  //     const { productId } = req.body;

  //     const cart = await Cart.findById(cartId);
  //     if (!cart) {
  //       throw new ApiError("Cart not found", 404, "CartNotFound");
  //     }

  //     // if (cart.buyer.toString() !== req.user._id.toString()) {
  //     //   throw new ApiError(
  //     //     " You are not the owner of this cart",
  //     //     403,
  //     //     "youAreNotTheOwnerOfThisCart"
  //     //   );
  //     // }

  //     const productIndex = cart.products.indexOf(
  //       new mongoose.Types.ObjectId(productId)
  //     );
  //     if (productIndex > -1) {
  //       cart.products.splice(productIndex, 1);
  //     } else {
  //       throw new ApiError(
  //         "Product not found in cart",
  //         404,
  //         "ProductNotFoundInCart"
  //       );
  //     }

  //     await cart.save();

  //     res.status(200).json({
  //       message: "Product has been removed.",
  //       cart,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     throw new ApiError(
  //       "Could not delete product from cart",
  //       400,
  //       "DeleteProductFailed"
  //     );
  //   }
  // });
};
