import ApiError from "../errors/ApiError";
import mongoose from "mongoose";
import Session from "../middlewares/Session";
import Products from "../db/products";
import Cart from "../db/cart";

export default (router) => {
  router.post("/carts", Session, async (req, res, next) => {
    try {
      const { productId } = req.body;

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
        });
      }

      // Ürünü sepete ekle
      cart.products.push(new mongoose.Types.ObjectId(productId));

      // Sepeti kaydet
      await cart.save();

      res.status(200).json({
        message: "Product added on cart.",
        cart,
      });
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "Cart could not be created",
        400,
        "cartCreationFailed"
      );
    }
  });
  router.get("/getCart", Session, async (req, res) => {
    try {
      const cart = await Cart.findOne({
        buyer: req.user._id,
        completed: false,
      }).populate("products");
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

      // if (cart.buyer.toString() !== req.user._id.toString()) {
      //   throw new ApiError(
      //     " You are not the owner of this cart",
      //     403,
      //     "youAreNotTheOwnerOfThisCart"
      //   );
      // }

      const productIndex = cart.products.indexOf(
        new mongoose.Types.ObjectId(productId)
      );
      if (productIndex > -1) {
        cart.products.splice(productIndex, 1);
      } else {
        throw new ApiError(
          "Product not found in cart",
          404,
          "ProductNotFoundInCart"
        );
      }

      await cart.save();

      res.status(200).json({
        message: "Product has been removed.",
        cart,
      });
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "Could not delete product from cart",
        400,
        "DeleteProductFailed"
      );
    }
  });
};
