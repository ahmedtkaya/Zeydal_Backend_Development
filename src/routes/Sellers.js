import Seller from "../db/seller";
import Products from "../db/products";
import Cart from "../db/cart";
// import Users from "../db/users";
import ApiError from "../errors/ApiError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import getUserIp from "../middlewares/getUserIP";
import Session from "../middlewares/Session";
import sendVerificationEmail from "../middlewares/VerificationEmail";
import forgotPasswordEmail from "../middlewares/ForgotPasswordMail";
import {
  checkLotsOfRequiredField,
  checkRequiredField,
} from "../helpers/RequiredCheck";
import { noExistVariable } from "../helpers/CheckExistence";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
      const originalName = file.originalname;
      cb(null, originalName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;

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

const getSellerOrders = async (seller) => {
  // Satıcının sahip olduğu ürünleri buluyoruz
  const products = await Products.find({ seller: seller }).select("_id");
  const productIds = products.map((product) => product._id);

  // Satıcının ürünlerinin olduğu tamamlanmış sepetleri buluyoruz
  const carts = await Cart.find({
    "items.productId": { $in: productIds }, // Sepetteki ürünler arasında satıcının ürünleri olanları seçiyoruz
    completed: true, // Tamamlanmış sepetleri filtreliyoruz
  });

  // Şimdi sadece bu satıcıya ait olan ürünleri filtreleyeceğiz
  const sellerOrders = carts.map((cart) => {
    // Sadece bu satıcının ürünlerini filtreliyoruz
    const sellerItems = cart.products.filter((item) =>
      productIds.includes(item.productId.toString())
    );

    return {
      cartId: cart._id,
      userId: cart.userId,
      products: sellerItems, // Sadece satıcının ürünleri
    };
  });

  return sellerOrders.filter((order) => order.items.length > 0); // Sadece satıcının ürünü olan siparişleri döndür
};

export default (router) => {
  router.post(
    "/seller/register",
    getUserIp,
    upload.fields([
      { name: "SellerLogo", maxCount: 1 }, // SellerLogo için 1 dosya
      { name: "documents", maxCount: 10 }, // Documents için en fazla 10 dosya
    ]),
    async (req, res, next) => {
      const {
        SellerEmail,
        SellerName,
        SellerLogo,
        phoneNumber,
        SellerPassword,
        address,
        city,
      } = req.body;

      try {
        checkLotsOfRequiredField([
          { field: SellerEmail, fieldName: "E-Mail" },
          { field: SellerName, fieldName: "Name" },
          { field: phoneNumber, fieldName: "Phone Number" },
          { field: address, fieldName: "Address" },
          { field: city, fieldName: "City" },
        ]);
      } catch (error) {
        return res.status(400).send(error);
      }

      const existingSeller = await Seller.findOne({ SellerEmail });
      if (existingSeller) {
        return res
          .status(400)
          .send(new ApiError(400, "Bu e-posta zaten kullanılıyor"));
      }

      const seller = new Seller({
        SellerEmail,
        SellerName,
        phoneNumber,
        SellerPassword,
        SellerLogo: req.files["SellerLogo"]
          ? req.files["SellerLogo"][0].path
          : undefined,
        documents: req.files["documents"]
          ? req.files["documents"].map((file) => file.path)
          : [],
        address,
        city,
        ip: req.userIp,
      });

      try {
        await seller.save();
        req.user = seller;
        next();
        res.status(200).json("Seller Oluşturuldu, onay bekleniyor.");
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .send(new ApiError(500, "Kayıt işlemi sırasında hata oluştu"));
      }
    }
  );

  router.post("/seller/login", async (req, res) => {
    const { SellerEmail, SellerPassword } = req.body;
    const seller = await Seller.findOne({ SellerEmail });

    try {
      checkLotsOfRequiredField([
        { field: SellerEmail, fieldName: "E-Mail" },
        { field: SellerPassword, fieldName: "Password" },
      ]);
    } catch (error) {
      return res.status(400).json(error);
    }

    if (!seller) {
      throw new ApiError(
        "Incorrect Password or email2",
        401,
        "userOrPasswordIncorrect"
      );
    }
    if (seller.isVerified == false) {
      throw new ApiError(
        "You have to verificate your account.",
        401,
        "accountNotVerified"
      );
    }
    const passwordConfirmed = await bcrypt.compare(
      SellerPassword,
      seller.SellerPassword
    );
    // console.log("kullanıcı girdisi:", password); silinecekler
    // console.log("hashlenmiş hali:", user.password);

    if (passwordConfirmed) {
      const sellerJson = seller.toJSON();
      const token = jwt.sign(sellerJson, process.env.JWT_SECRET);
      res.json({
        token: `Bearer ${token}`,
        seller: sellerJson,
      });
    } else {
      throw new ApiError(
        "Incorrect Password or email",
        401,
        "userOrPasswordIncorrect"
      );
    }
  });

  router.get("/seller/products", Session, async (req, res, next) => {
    try {
      const sellerId = req.user._id;
      const products = await Products.find({ seller: sellerId });
      if (!products || products.length === 0) {
        return res
          .status(400)
          .json({ message: "There is no such products in this user" });
      }
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      next(error);
      throw new ApiError("There is error", 404, "anError");
    }
  });

  router.put(
    "/seller/update",
    Session,
    upload.single("SellerLogo"),
    async (req, res) => {
      const { phoneNumber, address, city } = req.body;
      const seller = req.user;
      const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

      try {
        if (phoneNumber) {
          const existingSeller = await Seller.findOne({ phoneNumber });
          if (
            existingSeller &&
            existingSeller._id.toString() !== seller._id.toString()
          ) {
            throw new ApiError(
              "This phone number already using",
              400,
              "phoneNumberAlreadyUsing"
            );
          }
        }
        // Güncellenecek alanları dinamik olarak oluştur
        const updateFields = {
          ...(phoneNumber && { phoneNumber }),
          ...(address && { address }),
          ...(city && { city }),
          ...(logoPath && { SellerLogo: logoPath }), // Eğer logo yüklendiyse ekle
        };

        // Satıcıyı güncelle
        const updateSeller = await Seller.findByIdAndUpdate(
          seller._id,
          updateFields,
          { new: true }
        );

        // const updateSeller = await Seller.findByIdAndUpdate(
        //   seller,
        //   { phoneNumber, address, city },
        //   { new: true }
        // );

        if (!updateSeller) {
          throw new ApiError("Seller not found", 400, "notFoundSeller");
        }
        return res
          .status(200)
          .json({ message: "seller information has been changed", seller });
      } catch (error) {
        console.log(error);
        throw new ApiError(
          "Seller informations cannot change",
          500,
          "cannotChangeSellerInformation"
        );
      }
    }
  );

  router.get("/seller-orders/pending", Session, async (req, res) => {
    try {
      const sellerId = req.user._id; // Satıcı ID'si

      // 1. Satıcının ürünleri olan sepetleri ve ürünleri çekiyoruz
      const carts = await Cart.find({
        "products.seller": sellerId, // Satıcının ürünü olanlar
        "products.status": "pending", // Beklemede olanlar
        completed: true,
      })
        .populate(
          "buyer",
          "name surname email address phoneNumber zipCode city country"
        )
        .populate("products.productId"); // Alıcı bilgilerini getiriyoruz

      // 2. Sadece satıcının ürünlerini filtreliyoruz
      const sellerOrders = carts.map((cart) => {
        const sellerItems = cart.products.filter((product) => {
          return (
            product.seller.toString() === sellerId.toString() &&
            product.status === "pending"
          );
        });

        return {
          cartId: cart._id,
          buyer: cart.buyer,
          items: sellerItems
            .map((item) => {
              if (!item.productId) {
                // Eğer productId null ise, ürünü atlıyoruz
                return null;
              }

              return {
                productId: item.productId._id,
                productName: item.productId.name,
                productPrice: item.productId.price,
                productImages: item.productId.images,
                quantity: item.quantity,
                status: item.status,
              };
            })
            .filter((item) => item !== null), // Null olan ürünleri filtreliyoruz
        };
      });

      // Eğer satıcıya ait ürünler varsa döndürüyoruz
      res
        .status(200)
        .json(sellerOrders.filter((order) => order.items.length > 0));
    } catch (error) {
      console.error("Error while getting seller orders:", error);
      res.status(500).json({
        message: "Can not get seller orders",
        errorCode: "canNotGetSellerOrders",
      });
    }
  });
  router.get("/seller-orders/processing", Session, async (req, res) => {
    try {
      const sellerId = req.user._id; // Satıcı ID'si

      // 1. Satıcının ürünleri olan sepetleri ve ürünleri çekiyoruz
      const carts = await Cart.find({
        "products.seller": sellerId, // Satıcının ürünü olanlar
        "products.status": "processing", // Beklemede olanlar
        completed: true,
      })
        .populate(
          "buyer",
          "name surname email address phoneNumber zipCode city country"
        )
        .populate("products.productId"); // Alıcı bilgilerini getiriyoruz

      // 2. Sadece satıcının ürünlerini filtreliyoruz
      const sellerOrders = carts.map((cart) => {
        const sellerItems = cart.products.filter((product) => {
          return (
            product.seller.toString() === sellerId.toString() &&
            product.status === "processing"
          );
        });

        return {
          cartId: cart._id,
          buyer: cart.buyer,
          items: sellerItems
            .map((item) => {
              if (!item.productId) {
                // Eğer productId null ise, ürünü atlıyoruz
                return null;
              }

              return {
                productId: item.productId._id,
                productName: item.productId.name,
                productPrice: item.productId.price,
                productImages: item.productId.images,
                quantity: item.quantity,
                status: item.status,
              };
            })
            .filter((item) => item !== null), // Null olan ürünleri filtreliyoruz
        };
      });

      // Eğer satıcıya ait ürünler varsa döndürüyoruz
      res
        .status(200)
        .json(sellerOrders.filter((order) => order.items.length > 0));
    } catch (error) {
      console.error("Error while getting seller orders:", error);
      res.status(500).json({
        message: "Can not get seller orders",
        errorCode: "canNotGetSellerOrders",
      });
    }
  });
  router.get("/seller-orders/completed", Session, async (req, res) => {
    try {
      const sellerId = req.user._id; // Satıcı ID'si

      // 1. Satıcının ürünleri olan sepetleri ve ürünleri çekiyoruz
      const carts = await Cart.find({
        "products.seller": sellerId, // Satıcının ürünü olanlar
        "products.status": "completed", // Beklemede olanlar
        completed: true,
      })
        .populate(
          "buyer",
          "name surname email address phoneNumber zipCode city country"
        )
        .populate("products.productId"); // Alıcı bilgilerini getiriyoruz

      // 2. Sadece satıcının ürünlerini filtreliyoruz
      const sellerOrders = carts.map((cart) => {
        const sellerItems = cart.products.filter((product) => {
          return (
            product.seller.toString() === sellerId.toString() &&
            product.status === "completed"
          );
        });

        return {
          cartId: cart._id,
          buyer: cart.buyer,
          items: sellerItems
            .map((item) => {
              if (!item.productId) {
                // Eğer productId null ise, ürünü atlıyoruz
                return null;
              }

              return {
                productId: item.productId._id,
                productName: item.productId.name,
                productPrice: item.productId.price,
                productImages: item.productId.images,
                quantity: item.quantity,
                status: item.status,
              };
            })
            .filter((item) => item !== null), // Null olan ürünleri filtreliyoruz
        };
      });

      // Eğer satıcıya ait ürünler varsa döndürüyoruz
      res
        .status(200)
        .json(sellerOrders.filter((order) => order.items.length > 0));
    } catch (error) {
      console.error("Error while getting seller orders:", error);
      res.status(500).json({
        message: "Can not get seller orders",
        errorCode: "canNotGetSellerOrders",
      });
    }
  });

  router.post(
    "/seller-orders/:cartId/product/:productId/mark-processed",
    Session,
    async (req, res) => {
      try {
        const sellerId = req.user._id; // Satıcı ID'sini oturumdan alıyoruz
        const { cartId, productId } = req.params; // Ürün ID'si

        // 1. Satıcının ürünlerini içeren sepette ilgili ürünü buluyoruz ve güncelliyoruz
        const cart = await Cart.findOneAndUpdate(
          {
            _id: cartId,
            "products.productId": productId, // Sepette ürün ID'sine göre filtreleme
            "products.seller": sellerId, // Sadece satıcının ürünü olmalı
            "products.status": "pending", // Beklemede olan ürünleri bul
          },
          {
            $set: { "products.$[element].status": "processing" }, // İlgili ürünün durumunu güncelle
          },
          {
            arrayFilters: [
              { "element.productId": productId, "element.seller": sellerId },
            ], // Sadece bu ürünü güncelle
            new: true,
          }
        );

        if (!cart) {
          return res.status(404).json({
            message: "No pending orders found for this seller's product.",
          });
        }

        res.status(200).json({
          message: "Product in the order has been marked as processed.",
        });
      } catch (error) {
        console.error("Error while marking product as processed:", error);
        res
          .status(500)
          .json({ message: "Error while processing the product in the order" });
      }
    }
  );

  router.post(
    "/seller-orders/:cartId/product/:productId/mark-completed",
    Session,
    async (req, res) => {
      try {
        const sellerId = req.user._id; // Satıcı ID'si
        const { cartId, productId } = req.params;

        // 1. Satıcının ürünlerini içeren sepeti buluyoruz ve durumu güncelliyoruz
        const cart = await Cart.findOneAndUpdate(
          {
            _id: cartId,
            "products.productId": productId,
            "products.seller": sellerId,
            "products.status": "processing", // İşlenmekte olanları tamamla
          },
          {
            $set: { "products.$[element].status": "completed" },
          },
          {
            arrayFilters: [
              { "element.productId": productId, "element.seller": sellerId },
            ],
            new: true,
          }
        );

        if (!cart) {
          return res.status(404).json({
            message: "No processing orders found for this seller's product.",
          });
        }

        res.status(200).json({
          message: "Product in the order has been marked as completed.",
        });
      } catch (error) {
        console.error("Error while marking product as completed:", error);
        res
          .status(500)
          .json({ message: "Error while completing the product in the order" });
      }
    }
  );

  router.put("/seller/change-password", Session, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const seller = req.user;
    try {
      const existingSeller = await Seller.findById(seller._id);
      if (!existingSeller) {
        throw new ApiError("User Not Found", 404, "notFoundUser");
      }

      const isMatchPassword = await bcrypt.compare(
        oldPassword,
        existingSeller.SellerPassword
      );
      if (!isMatchPassword) {
        throw new ApiError(
          "Incorrect old password",
          404,
          "incorrectOldPassword"
        );
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(
          "New password and confirm password do not match",
          404,
          "passwordsDoNotMatch"
        );
      }

      const isSamePassword = await bcrypt.compare(
        newPassword,
        existingSeller.SellerPassword
      );
      if (isSamePassword) {
        throw new ApiError(
          "New Password cannot be the same as the old password",
          400,
          "sameAsOldPassword"
        );
      }

      existingSeller.SellerPassword = newPassword;
      await existingSeller.save();
      console.log("Old Password (unhashed):", oldPassword);
      console.log("New Password (unhashed):", newPassword);

      return res
        .status(200)
        .json({ message: "Password has been changed successfully", seller });
    } catch (error) {
      console.log(error);
      res.status(error.statusCode || 500).json({
        message: error.message || "Password change failed",
        code: error.code || "passwordChangeFailed",
      });
    }
  });

  router.post(
    "/seller/forgot-password",
    forgotPasswordEmail,
    async (req, res) => {
      const { SellerEmail } = req.body;

      const userEmail = await Seller.findOne({ SellerEmail });

      noExistVariable(userEmail, "Email");
      res.status(200).send("Link has been send");
    }
  );

  router.get("/seller/:id", Session, async (req, res) => {
    const { id } = req.params;
    try {
      const sellerId = await Seller.findById(id);
      noExistVariable(sellerId, "Seller");
      res.status(200).json(sellerId);
    } catch (error) {
      console.log(error);
      res.status(400).json("Error");
    }
  });
};
