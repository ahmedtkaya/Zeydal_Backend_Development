import nodemailer from "nodemailer";
import crypto from "crypto";
import Users from "../db/users"; // Kullanıcı modelinizi buraya dahil edin
import ApiError from "../errors/ApiError";
import { notFoundVariable } from "../helpers/CheckExistence";
import { checkRequiredField } from "../helpers/RequiredCheck";

// Rastgele şifre üretme fonksiyonu
const generateRandomPassword = (length = 12) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

const forgotPasswordEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    checkRequiredField(email, "Email");

    const user = await Users.findOne({ email });

    notFoundVariable(user, "User");

    // Rastgele bir şifre oluştur
    const newPassword = generateRandomPassword();

    // Kullanıcının şifresini yeni rastgele şifre ile güncelle
    user.password = newPassword;
    await user.save();

    // E-posta ayarları
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_SENDER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_SENDER,
      to: email,
      subject: "Yeni Şifre",
      html: `<p>Yeni şifreniz: <strong>${newPassword}</strong></p>`,
    };

    // E-postayı gönder
    await transporter.sendMail(mailOptions);

    // Başarı yanıtı
    res
      .status(200)
      .json({ message: "Yeni şifreniz e-posta adresinize gönderildi." });
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

export default forgotPasswordEmail;
