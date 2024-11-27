import crypto from "crypto";
import nodemailer from "nodemailer";
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
    console.log("Yeni Şifre", newPassword);

    // Kullanıcının şifresini yeni rastgele şifre ile güncelle
    user.password = newPassword;
    await user.save();

    // E-posta ayarları
    const transporter = nodemailer.createTransport({
      host: "smtp.yandex.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_SENDER_PASSWORD,
      },
      debug: true,
      logger: true,
    });

    // HTML e-posta tasarımı
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://via.placeholder.com/150x50?text=Your+Logo" alt="Logo" style="max-width: 100px; margin-bottom: 20px;" />
          <h2 style="color: #444;">Şifre Sıfırlama Talebiniz Tamamlandı</h2>
        </div>
        <p style="font-size: 16px;">Merhaba <strong>${
          user.name || "Kullanıcı"
        }</strong>,</p>
        <p style="font-size: 16px;">Hesabınız için yeni bir şifre oluşturuldu. Aşağıda bu şifreyi bulabilirsiniz:</p>
        <div style="background-color: #eef5fc; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; border: 1px solid #d6e4f2;">
          <p style="font-size: 18px; font-weight: bold; color: #2a7ade;">${newPassword}</p>
        </div>
        <p style="font-size: 16px;">Güvenliğiniz için lütfen giriş yaptıktan sonra bu şifreyi değiştirin.</p>
        <p style="font-size: 16px;">Herhangi bir sorunla karşılaşırsanız lütfen bizimle iletişime geçmekten çekinmeyin.</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 14px; color: #666; text-align: center;">
          Bu e-posta, şifre sıfırlama talebiniz üzerine gönderilmiştir. Eğer bu talebi siz yapmadıysanız, lütfen bizimle iletişime geçin.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"TURKOTREND" <${process.env.MAIL_SENDER}>`,
      to: email,
      subject: "Şifre Sıfırlama Talebiniz",
      html: emailTemplate,
    };

    // E-postayı gönder
    await transporter.sendMail(mailOptions);

    // Başarı yanıtı
    res
      .status(200)
      .json({ message: "Yeni şifreniz e-posta adresinize gönderildi." });
  } catch (error) {
    console.error(error);
    next(
      new ApiError(
        "There was an error sending the password reset email",
        500,
        "emailSendingError"
      )
    );
  }
};

export default forgotPasswordEmail;
