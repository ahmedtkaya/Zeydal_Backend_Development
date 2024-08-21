import { Types } from "mongoose";
import moment from "moment";
import mongoose from "mongoose";
import Session from "../middlewares/Session";
import id from "../utils/uuid";
import * as Installments from "../services/iyzico/methods/installments";
import ApiError from "../errors/ApiError";
import Carts from "../db/cart";

const { ObjectId } = Types;

export default (router) => {
  //fiyata göre taksit kontrolü
  router.post("/installments", Session, async (req, res) => {
    const { binNumber, price } = req.body;
    if (!binNumber || !price) {
      throw new ApiError("Missing Parameters", 400, "missingParameters");
    }
    const result = await Installments.checkInstallment({
      locale: req.user.locale,
      conversationId: id(),
      binNumber: binNumber,
      price: price,
    });
    res.json(result);
  });

  //sepet tutarına göre taksit
  router.post("/installments/:cartId", Session, async (req, res, next) => {
    try {
      const { binNumber } = req.body;
      const { cartId } = req.params;

      if (!cartId) {
        throw new ApiError("Cart id is required", 400, "cartIdRequired");
      }

      const cart = await Carts.findOne({
        _id: new ObjectId(cartId),
      }).populate("products", {
        _id: 1,
        price: 1,
      });

      if (!cart) {
        throw new ApiError("Cart not found", 404, "cartNotFound");
      }

      const price = cart.products
        .map((product) => product.price)
        .reduce((a, b) => a + b, 0);

      if (!binNumber || price === undefined) {
        throw new ApiError("Missing parameters", 400, "missingParameters");
      }
      const result = await Installments.checkInstallment({
        locale: req.user.locale,
        conversationId: id(),
        binNumber: binNumber,
        price: price,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
};
