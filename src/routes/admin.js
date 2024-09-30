import Seller from "../db/seller";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import Session from "../middlewares/Session";

export default (router) => {
  // Onay bekleyen seller'ları listeleme
  router.get("/seller/pending", Session, async (req, res) => {
    if (req.user.role !== "admin") {
      throw new ApiError(
        "Forbidden: Insufficient permissions",
        403,
        "InsufficientPermissions"
      );
    }
    try {
      const pendingSellers = await Seller.find({ isVerified: false });
      if (!pendingSellers) {
        throw new ApiError("Does not exist seller pending");
      }
      return res.status(200).json(pendingSellers);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(new ApiError(500, "Satıcılar listelenirken hata oluştu."));
    }
  });

  router.put("/seller/verify/:id", Session, async (req, res, next) => {
    const { id } = req.params;
    const { action } = req.body;
    if (req.user.role !== "admin") {
      throw new ApiError(
        "Forbidden: Insufficient permissions",
        403,
        "InsufficientPermissions"
      );
    }
    try {
      const seller = await Seller.findById(id);

      if (!seller) {
        throw new ApiError("No exist Seller", 404, "noExistSeller");
      }
      if (action === "approve") {
        seller.isVerified = true;
        await seller.save();
        return res.status(200).json({ message: "Seller is verified", seller });
      } else if (action === "reject") {
        await Seller.findByIdAndDelete(id);
        return res
          .status(200)
          .json({ message: "Seller is rejected and deleted" });
      } else {
        return res.status(400).send(new ApiError(400, "invalid transaction"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(new ApiError(500, "There is an error while verify transaction"));
    }
  });

  router.get("/admin/get-all-users", Session, async (req, res) => {
    if (req.user.role !== "admin") {
      throw new ApiError(
        "Forbidden: Insufficient permissions",
        403,
        "InsufficientPermissions"
      );
    }

    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "There must be error while get all users",
        404,
        "errorGetAllUsers"
      );
    }
  });

  router.get("/admin/get-all-sellers", Session, async (req, res) => {
    if (req.user.role !== "admin") {
      throw new ApiError(
        "Forbidden: Insufficient permissions",
        403,
        "InsufficientPermissions"
      );
    }

    try {
      const sellers = await Seller.find().select("-SellerPassword");
      res.status(200).json(sellers);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "There must be error while get all sellers",
        404,
        "errorGetAllSellers"
      );
    }
  });
};
