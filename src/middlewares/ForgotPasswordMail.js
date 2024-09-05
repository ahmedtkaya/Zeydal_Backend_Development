import nodemailer from "nodemailer";
import crypto from "crypto";
import Users from "../db/users"; // Kullanıcı modelinizi buraya dahil edin
import ApiError from "../errors/ApiError";

// Rastgele şifre üretme fonksiyonu
const generateRandomPassword = (length = 12) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

const forgotPasswordEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, "E-posta adresi gereklidir."));
  }

  try {
    // Kullanıcıyı e-posta adresi ile bul
    const user = await Users.findOne({ email });
    if (!user) {
      return next(new ApiError(404, "Kullanıcı bulunamadı."));
    }

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
    console.error("Şifre yenileme hatası:", error);
    return next(new ApiError(500, "Yeni şifre e-postası gönderilemedi."));
  }
};

export default forgotPasswordEmail;
