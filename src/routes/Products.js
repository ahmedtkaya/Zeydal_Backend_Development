import Users from "../db/users";
import ApiError from "../errors/ApiError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Session from "../middlewares/Session";
import Role from "../middlewares/RoleMiddleware";
import Products from "../db/products";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export default (router) => {
  router.post(
    "/create-product",
    Session,
    upload.array("images", 10),
    async (req, res, next) => {
      try {
        if (req.user.role !== "admin") {
          //user role admin değilse burası değilde ekleme esnasındaki hata veriyor, buna bir bakalım(kod sorunsuz çalışıyor)
          throw new ApiError(
            "Forbidden: Insufficient permissions",
            403,
            "InsufficientPermissions"
          );
        }

        const { name, categories, brand, definition, price, stock } = req.body;
        const imagePaths = req.files.map((file) => file.path);

        const product = new Products({
          name,
          images: imagePaths,
          categories,
          brand,
          definition,
          price,
          stock,
        });

        await product.save();
        res.status(201).json(product);
      } catch (error) {
        next(
          new ApiError("Product could not be added", 401, "DoesNotAddedProduct")
        );
      }
    }
  );

  router.get("/get-all-products", Session, async (req, res) => {
    try {
      const getAllProducts = await Products.find();
      res.status(201).json(getAllProducts);
    } catch (error) {
      new ApiError("Products can not get", 401, "CannotGetProducts");
    }
  });

  router.get("/get-products-by-category", Session, async (req, res) => {
    const category = req.query.category;
    if (!category) {
      return res
        .status(400)
        .json(new ApiError("Category is required", 401, "RequiredCategory"));
    }

    try {
      const products = await Products.find({
        categories: category,
      });
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json(
          new ApiError(
            "Products cannot be retrieved by category",
            401,
            "CannotGetProductsByCategory"
          )
        );
    }
  });

  router.get("/get-product-by-id/:id", Session, async (req, res) => {
    const { id } = req.params;

    try {
      const product = await Products.findById(id);
      if (!product) {
        return res
          .status(404)
          .json(new ApiError("Product not found", 404, "ProductNotFound"));
      }
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json(
          new ApiError("Product cannot be retrieved", 500, "CannotGetProduct")
        );
    }
  });

  router.delete("/delete-product/:id", Session, async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Products.findOneAndDelete({ _id: id });
      if (product) {
        res.status(200).json(`Product number ${id} was deleted`);
      } else {
        res.status(404).json(`Product with ID ${id} not found`);
      }
    } catch (error) {
      res.status(500).json({ message: "Cannot delete product", error });
    }
  });
};
