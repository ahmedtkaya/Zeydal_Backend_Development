import mongoose from "mongoose";
import uuid from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const ItemTransactionSchema = new Schema({
  uuid: {
    type: String,
    default: () => uuid(), //hata alırsak tüm dblerdeki uuidlere bi bak
    unique: true,
    required: true,
  },
  itemId: {
    type: ObjectId,
    required: true,
    ref: "Products",
  },
  paymentTransactionId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  paidPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: false,
  },
  isApprove: {
    type: Boolean,
    default: false,
  },
  isDisApprove: {
    type: Boolean,
    default: false,
  },
});

const PaymentsSuccessSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid(),
      unique: true,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["success"],
    },
    cartId: {
      type: ObjectId,
      ref: "Carts",
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["TRY", "USD", "EUR"],
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paidPrice: {
      type: Number,
      required: true,
    },
    itemTransactions: {
      type: [ItemTransactionSchema],
    },
    log: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    _id: true,
    collection: "payment-success",
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

const PaymentsSuccess = mongoose.model("PaymentSuccess", PaymentsSuccessSchema);
export default PaymentsSuccess;
