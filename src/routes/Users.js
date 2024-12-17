import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Cart from "../db/cart";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import { noExistVariable, notFoundVariable } from "../helpers/CheckExistence";
import {
  checkLotsOfRequiredField,
  checkRequiredField,
} from "../helpers/RequiredCheck";
import { forgotPasswordEmail } from "../middlewares/ForgotPasswordMail";
import Session from "../middlewares/Session";
import sendVerificationEmail from "../middlewares/VerificationEmail";
import getUserIp from "../middlewares/getUserIP";

export default (router) => {
  router.post(
    "/register",
    getUserIp,
    async (req, res, next) => {
      const {
        email,
        name,
        surname,
        phoneNumber,
        identityNumber,
        password,
        address,
        city,
        country,
        zipCode,
      } = req.body;

      try {
        checkLotsOfRequiredField([
          { field: email, fieldName: "E-Mail" },
          { field: name, fieldName: "Name" },
          { field: surname, fieldName: "Surname" },
          { field: phoneNumber, fieldName: "Phone Number" },
          { field: address, fieldName: "Address" },
          { field: city, fieldName: "City" },
          { field: country, fieldName: "Country" },
          { field: zipCode, fieldName: "Zip Code" },
          { field: identityNumber, fieldName: "İdentity Number" },
        ]);
      } catch (error) {
        return res.status(400).send(error);
      }

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .send(new ApiError(400, "Bu e-posta zaten kullanılıyor"));
      }

      const user = new Users({
        email,
        name,
        surname,
        phoneNumber,
        identityNumber,
        password,
        address,
        city,
        country,
        zipCode,
        ip: req.userIp, // Kullanıcı IP'sini ekle
      });

      try {
        await user.save();
        req.user = user;
        next();
        // return res
        //   .status(200)
        //   .json(`${email} mail adresi ile kullanıcı oluşturuldu.`);
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .send(new ApiError(500, "Kayıt işlemi sırasında hata oluştu"));
      }
    },
    sendVerificationEmail, //silinebilir çalışmazsa
    (req, res) => {
      return res.status(200).json(
        `${req.user.email} mail adresi ile kullanıcı oluşturuldu. Lütfen E-postanızı doğrulayınız.` //middlewaredeki üretilen jwtyi konsola yazdır
      );
    }
  );

  router.get("/verify-email/", async (req, res) => {
    const { token } = req.query;

    try {
      checkRequiredField(token, "Token");
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(decoded.id);

      notFoundVariable(user, "User");

      if (user.isVerified) {
        return res
          .status(400)
          .send(new ApiError(400, "Kullanıcı zaten doğrulanmış"));
      }

      user.isVerified = true;
      await user.save();

      return res.sendFile("verification-success.html", { root: "public" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(new ApiError(500, "Doğrulama işlemi sırasında hata oluştu"));
    }
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    try {
      checkLotsOfRequiredField([
        { field: email, fieldName: "E-Mail" },
        { field: password, fieldName: "Password" },
      ]);
    } catch (error) {
      return res.status(400).json(error);
    }

    if (!user) {
      throw new ApiError(
        "Incorrect Password or email",
        401,
        "userOrPasswordIncorrect"
      );
    }
    if (user.isVerified == false) {
      throw new ApiError(
        "You have to verificate your account.",
        401,
        "accountNotVerified"
      );
    }
    const passwordConfirmed = await bcrypt.compare(password, user.password);
    // console.log("kullanıcı girdisi:", password); silinecekler
    // console.log("hashlenmiş hali:", user.password);

    if (passwordConfirmed) {
      const userJson = user.toJSON();
      const token = jwt.sign(userJson, process.env.JWT_SECRET);
      res.json({
        token: `Bearer ${token}`,
        user: userJson,
      });
    } else {
      throw new ApiError(
        "Incorrect Password or email",
        401,
        "userOrPasswordIncorrect"
      );
    }
  });

  router.put("/user/update", Session, async (req, res) => {
    const { phoneNumber, address, city } = req.body;
    const user = req.user;

    try {
      if (phoneNumber) {
        const existingUser = await Users.findOne({ phoneNumber });
        if (
          existingUser &&
          existingUser._id.toString() !== user._id.toString()
        ) {
          throw new ApiError(
            "This phone number already using",
            400,
            "phoneNumberAlreadyUsing"
          );
        }
      }

      const updateUser = await Users.findByIdAndUpdate(
        user,
        { phoneNumber, address, city },
        { new: true }
      );
      notFoundVariable(updateUser, "User");

      return res
        .status(200)
        .json({ message: "user information has been changed", user });
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "User informations cannot change",
        500,
        "cannotChangeUserInformation"
      );
    }
  });

  router.put("/user/change-password", Session, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;
    try {
      const existingUser = await Users.findById(user._id);
      if (!existingUser) {
        throw new ApiError("User Not Found", 404, "notFoundUser");
      }

      const isMatchPassword = await bcrypt.compare(
        oldPassword,
        existingUser.password
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
        existingUser.password
      );
      if (isSamePassword) {
        throw new ApiError(
          "New Password cannot be the same as the old password",
          400,
          "sameAsOldPassword"
        );
      }

      existingUser.password = newPassword;
      await existingUser.save();
      console.log("Old Password (unhashed):", oldPassword);
      console.log("New Password (unhashed):", newPassword);

      return res
        .status(200)
        .json({ message: "Password has been changed successfully", user });
    } catch (error) {
      console.log(error);
      res.status(error.statusCode || 500).json({
        message: error.message || "Password change failed",
        code: error.code || "passwordChangeFailed",
      });
    }
  });

  router.post("/forgot-password", forgotPasswordEmail, async (req, res) => {
    const { email } = req.body;
    const userEmail = await Users.findOne({ email });
    noExistVariable(userEmail, "Email");

    res.status(200).send("Link has been send");
  });

  router.get("/user/orders/:cartId", Session, async (req, res) => {
    const { cartId } = req.params;
    const userId = req.user._id;
    try {
      const userOrders = await Cart.findOne({
        _id: cartId,
        completed: true,
        buyer: userId,
      })
        .populate("products.productId", "name price images categories")
        .populate("products.seller", "SellerName");
      if (!userOrders) {
        throw new ApiError(
          "Cart not found or not completed",
          404,
          "cartNotFound"
        );
      }

      res.status(200).json(userOrders);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "Could not get cart orders",
        400,
        "getCartOrderFailed"
      );
    }
  });

  router.get("/user/orders", Session, async (req, res) => {
    try {
      const userOrders = await Cart.find({
        buyer: req.user._id,
        completed: true,
      })
        .populate("products.productId", "name price images categories")
        .populate("products.seller", "SellerName");

      res.status(200).json(userOrders);
    } catch (error) {
      console.log(error);
      throw new ApiError("Could not get orders", 400, "getOrderFailed");
    }
  });

  // router.get("/user/orders", Session, async (req, res) => {
  //   const userId = req.user._id;
  //   try {
  //     // const cart = await Cart.find({ buyer: req.user._id, completed: true });
  //     const paymentSuccess = await PaymentSuccess.find({
  //       status: "success",
  //     })
  //       .select("price paymentId createdAt")
  //       .populate({ path: "cartId", select: "buyer" });

  //     // Giriş yapan kullanıcıya ait olan ödemeleri filtreliyoruz
  //     const userPayments = paymentSuccess.filter((payment) => {
  //       // Populate edilmiş cartId içerisinden buyer kontrolü yapıyoruz
  //       return String(payment.cartId.buyer) === String(userId);
  //     });

  //     if (userPayments.length === 0) {
  //       return res
  //         .status(404)
  //         .json({ message: "No payments found for this user" });
  //     }

  //     res.status(200).json({ userPayments });
  //   } catch (error) {
  //     console.log(error);
  //     throw new ApiError("Could not get orders", 400, "getOrderFailed");
  //   }
  // });
};
