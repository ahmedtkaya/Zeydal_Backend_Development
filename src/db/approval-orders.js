import mongoose from "mongoose";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const ApprovalOrdersSchema = new Schema({
  paymentTransactionId: {
    type: String,
  },
  cartId: {
    type: ObjectId,
    ref: "Carts",
  },
  price: {
    type: Number,
  },
  itemId: {
    type: ObjectId,
    ref: "Products",
  },
  name: {
    type: String,
  },
  paidPrice: {
    type: Number,
  },
});

const ApprovalOrders = mongoose.model("ApprovalOrders", ApprovalOrdersSchema);

export default ApprovalOrders;
