import Comments from "../db/comments";
import Replies from "../db/replies";
import ApiError from "../errors/ApiError";
import { checkPermissions } from "../helpers/Permissions";
import Session from "../middlewares/Session";

export default (router) => {
  router.post("/create-comment", Session, async (req, res) => {
    checkPermissions(req.user, ["user"]);
    try {
      const { productId, rating, comment } = req.body;
      const user = req.user._id;

      const comments = new Comments({
        userId: user,
        comment,
        rating,
        productId: productId,
      });
      await comments.save();
      res.status(200).json(comments);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "Comments could not sending",
        400,
        "CouldNotSendingComments"
      );
    }
  });
  router.get("/comments", Session, async (req, res) => {
    checkPermissions(req.user, ["user"]);
    try {
      const { productId, userId } = req.query;
      const filter = {};

      // productId varsa filtreye ekle
      if (productId) {
        filter.productId = productId;
      }

      // userId varsa filtreye ekle
      if (userId) {
        filter.userId = userId;
      }
      //   checkRequiredField(productId, "Product Id");

      const comment = await Comments.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
      res.status(200).json(comment);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "Can not get Comments by productId",
        400,
        "CanNotGetComments"
      );
    }
  });
  router.delete("/delete-comment/:id", Session, async (req, res) => {
    const id = req.params.id;
    try {
      const comment = await Comments.findOneAndDelete({ _id: id });
      // checkCommentOwnerShip(req.user, comment);
      if (!comment) {
        throw new ApiError("It was already deleted", 400, "AlreadyDeleted");
      }
      if (comment) {
        res.status(200).json(`Comment number ${id} was deleted`);
      } else {
        res.status(404).json(`Product with ID ${id} not found`);
      }
    } catch (error) {
      console.log(error);
      throw new ApiError("Cannot delete comment", 400, "CanNotDeleteComment");
    }
  });
  router.get("/comments-with-replies", Session, async (req, res) => {
    checkPermissions(req.user, ["user", "seller"]);

    try {
      const { productId } = req.query;

      const comments = await Comments.find({ productId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await Replies.find({ commentId: comment._id })
          .populate("sellerId", "name email");
          return {
            ...comment._doc, // Yoruma ait tüm veriler
            replies, // Dinamik olarak eklenen yanıtlar
          };
        })
      );

      res.status(200).json(commentsWithReplies);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: "Cannot get comments with replies",
        errorCode: "CannotGetCommentsWithReplies",
        error: error.message,
      });
    }
  });
};
