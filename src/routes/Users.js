import Users from "../db/users";
import ApiError from "../errors/ApiError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getUserIp from "../middlewares/getUserIP";
import sendVerificationEmail from "../middlewares/VerificationEmail"; //silinebilir çalışmazsa

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
        password,
        address,
        city,
        country,
        zipCode,
      } = req.body;

      if (!email) {
        return res.status(400).send(new ApiError(400, "E-posta gereklidir"));
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

  //silinebilir çalışmazsa
  router.get("/verify-email/", async (req, res) => {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(new ApiError(400, "Token gereklidir"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(decoded.id);
      if (!user) {
        return res.status(400).send(new ApiError(400, "Kullanıcı bulunamadı"));
      }

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

    if (!email || !password) {
      throw new ApiError(
        "Email and Password is required",
        401,
        "requiredEmailAndPassword"
      );
    }

    if (!user) {
      throw new ApiError(
        "Incorrect Password or email2",
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
};
