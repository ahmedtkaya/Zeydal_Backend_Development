import Comments from "../db/comments";
import Products from "../db/products";
import Replies from "../db/replies";
import {
  checkCommentForProductOwner,
  checkPermissions,
} from "../helpers/Permissions";
import Session from "../middlewares/Session";

export default (router) => {
  router.post("/replies", Session, async (req, res) => {
    checkPermissions(req.user, ["seller"]); // Sadece satıcılar yanıt verebilir

    try {
      const { commentId, reply } = req.body;
      const sellerId = req.user._id; // Giriş yapan satıcı

      // Yorumun varlığını kontrol et
      const comment = await Comments.findById(commentId).populate("productId");
      if (!comment) {
        return res.status(404).json({
          message: "Comment not found",
          errorCode: "CommentNotFound",
        });
      }
      const product = await Products.findById(comment.productId);
      if (!product) {
        throw new ApiError("Product not found", 404, "productNotFound");
      }

      checkCommentForProductOwner(req.user, comment, product);

      // Yanıtı kaydet
      const newReply = new Replies({
        commentId,
        sellerId,
        reply,
      });

      await newReply.save();

      res.status(201).json({
        message: "Reply successfully added",
        reply: newReply,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: "Cannot add reply",
        errorCode: "CannotAddReply",
        error: error.message,
      });
    }
  });
};
