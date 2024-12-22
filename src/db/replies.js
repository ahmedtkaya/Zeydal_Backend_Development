const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const RepliesSchema = new mongoose.Schema(
  {
    commentId: {
      type: ObjectId,
      ref: "Comments",
      required: true,
    },
    sellerId: {
      type: ObjectId,
      ref: "Sellers",
      required: true,
    },
    reply: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    collection: "replies",
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

const Replies = mongoose.model("Replies", RepliesSchema);
export default Replies;
