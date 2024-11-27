import mongoose from "mongoose";
import uuid from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const PaymentsFailedSchema = new Schema(
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
      enum: ["failure"],
    },
    conversationId: {
      type: String,
      required: true,
    },
    errorCode: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    log: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    _id: true,
    collection: "payment-failed",
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

const PaymentsFailed = mongoose.model("PaymentsFailed", PaymentsFailedSchema);
export default PaymentsFailed;
