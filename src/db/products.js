import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import id from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const ProductsSchema = new Schema(
  {
    uuid: {
      type: String,
      default: id(),
      unique: false,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    definition: {
      type: String,
      required: true,
    },
    images: {
      type: [String], //text array olacak
      required: true,
    },
    categories: {
      type: [String],
    },
    seller: {
      type: ObjectId,
      ref: "Sellers",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "TRY",
      enum: ["TRY", "USD", "EUR"],
    },
    stock: {
      type: Number,
      default: 1,
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      default: "PHYSICAL",
      enum: ["PHYSICAL", "VIRTUAL"],
    },
  },
  {
    _id: true,
    collection: "products",
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

const Products = mongoose.model("Products", ProductsSchema);

export default Products;
