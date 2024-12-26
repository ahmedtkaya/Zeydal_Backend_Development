import mongoose from "mongoose";
import uuid from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const CartsSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid(),
      unique: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    buyer: {
      type: ObjectId,
      ref: "Users",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sellers",
          required: true,
        }, // Ürünün sahibi olan satıcı
        quantity: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "processing", "completed", "canceled"], // Ürün durumları
          default: "pending",
        },
      },
    ],
    currency: {
      type: String,
      required: true,
      default: "TRY",
      enum: ["TRY", "USD", "EUR"],
    },
  },
  {
    _id: true,
    collection: "carts",
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return {
          ...ret,
        };
      },
    },
  }
);

const Carts = mongoose.model("Carts", CartsSchema);

export default Carts;
