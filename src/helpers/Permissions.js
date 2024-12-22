import ApiError from "../errors/ApiError";

const checkPermissions = (user, roles) => {
  if (!roles.includes(user.role)) {
    throw new ApiError(
      "Forbidden: Insufficient permissions",
      403,
      "insufficientPermissions"
    );
  }
};

const checkProductOwnerShip = (user, product) => {
  if (
    user.role === "seller" &&
    product.seller.toString() !== user._id.toString()
  ) {
    throw new ApiError(
      "Forbidden: You are not authorized to delete this product",
      403,
      "unauthorized ProductDelete"
    );
  }
};
const checkCommentOwnerShip = (user, comment) => {
  if (
    user.role === "user" &&
    comment.users.toString() !== users._id.toString()
  ) {
    throw new ApiError(
      "Forbidden: You are not authorized to delete this product",
      403,
      "unauthorized ProductDelete"
    );
  }
};
// Satıcının ürününe gelen yorumu kontrol eder
const checkCommentForProductOwner = (user, comment, product) => {
  if (
    user.role === "seller" &&
    product.seller.toString() !== user._id.toString()
  ) {
    throw new ApiError(
      "Forbidden: You are not authorized to reply to this comment",
      403,
      "unauthorizedCommentReply"
    );
  }
};
module.exports = {
  checkPermissions,
  checkProductOwnerShip,
  checkCommentOwnerShip,
  checkCommentForProductOwner,
};
