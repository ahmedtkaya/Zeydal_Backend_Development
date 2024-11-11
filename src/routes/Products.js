import multer from "multer";
import path from "path";
import Products from "../db/products";
import ApiError from "../errors/ApiError";
import { notFoundVariable } from "../helpers/CheckExistence";
import {
  checkPermissions,
  checkProductOwnerShip,
} from "../helpers/Permissions";
import Session from "../middlewares/Session";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      const originalName = file.originalname;
      cb(null, originalName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;

    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new ApiError(
          "Invalid file type. Only JPEG, JPG, and PNG are allowed.",
          400,
          "InvalidFileType"
        )
      );
    }
  },
});

export default (router) => {
  router.post(
    "/create-product",
    Session,
    upload.array("images", 10),
    async (req, res, next) => {
      checkPermissions(req.user, ["admin", "seller"]);
      try {
        const { name, categories, definition, price, stock } = req.body;
        const imagePaths = req.files.map((file) => file.path);
        const sellerId = req.user._id;

        const product = new Products({
          name,
          images: imagePaths,
          categories,
          seller: sellerId,
          definition,
          price,
          stock,
        });

        await product.save();
        res.status(201).json(product);
      } catch (error) {
        console.log(error);
        next(
          new ApiError("Product could not be added", 401, "DoesNotAddedProduct")
        );
      }
    }
  );

  router.get("/get-all-products", async (req, res) => {
    try {
      const getAllProducts = await Products.find().populate("seller");

      if (getAllProducts.length === 0) {
        throw new ApiError(
          "There are no products available",
          404,
          "noFindProduct"
        );
      }

      res.status(200).json(getAllProducts);
    } catch (error) {
      // Hata ApiError ise, hata kodunu ve mesajını kullan
      if (error instanceof ApiError) {
        res.status(error.status).json({
          message: error.message,
          errorCode: error.code,
        });
      } else {
        // Eğer hata ApiError değilse, genel bir hata mesajı döndür
        res.status(500).json({
          message: "An unexpected error occurred",
          errorCode: "InternalServerError",
        });
      }
    }
  });

  router.get("/get-products-by-category", async (req, res) => {
    const category = req.query.category;
    if (!category) {
      return res
        .status(400)
        .json(new ApiError("Category is required", 401, "RequiredCategory"));
    }

    try {
      const products = await Products.find({
        categories: category,
      }).populate("seller");
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

  router.get("/get-product-by-id/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const product = await Products.findById(id).populate("seller");
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
      const sellerProduct = await Products.findById(id);

      const product = await Products.findOneAndDelete({ _id: id });
      checkProductOwnerShip(req.user, product);

      if (product) {
        res.status(200).json(`Product number ${id} was deleted`);
      } else {
        res.status(404).json(`Product with ID ${id} not found`);
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json(
          new ApiError("Cannot delete product", 401, "cannotDeleteProduct")
        );
    }
  });

  router.get("/get-categories", async (req, res) => {
    try {
      const products = await Products.find({});
      const categories = {};

      products.forEach((product) => {
        product.categories.forEach((cat) => {
          if (!categories[cat]) {
            categories[cat] = [];
          }
          categories[cat].push(product);
        });
      });

      res.json(categories);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json(
          new ApiError("Cannot get categories", 401, "cannotGetCategories")
        );
    }
  });

  router.put(
    "/update-product/:id",
    Session,
    upload.array("images", 10),
    async (req, res, next) => {
      checkPermissions(req.user, ["admin", "seller"]);
      try {
        const productId = req.params.id;
        const { name, categories, brand, definition, price, stock } = req.body;
        const imagePaths = req.files.map((file) => file.path);

        const product = await Products.findById(productId);

        notFoundVariable(product, "Product");

        checkProductOwnerShip(req.user, product);

        if (name) product.name = name;
        if (categories) product.categories = categories;
        if (brand) product.brand = brand;
        if (definition) product.definition = definition;
        if (price) product.price = price;
        if (stock) product.stock = stock;

        if (req.files.length > 0) {
          product.images = imagePaths;
        }

        await product.save();

        res.status(200).json(product);
      } catch (error) {
        console.log(error);
        next(
          new ApiError(
            "Product could not be updated",
            400,
            "DoesNotUpdatedProduct"
          )
        );
      }
    }
  );
};
