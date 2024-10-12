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
module.exports = { checkPermissions, checkProductOwnerShip };
