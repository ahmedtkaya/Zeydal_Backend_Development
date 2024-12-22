import mongoose from "mongoose";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const commentSchema = new mongoose.Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Products",
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "Users",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxLength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    _id: true,
    collection: "comments",
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

const Comments = mongoose.model("CommentSchema", commentSchema);
export default Comments;
