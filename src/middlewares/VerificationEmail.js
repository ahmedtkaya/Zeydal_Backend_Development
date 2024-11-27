import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Users from "../db/users";
import ApiError from "../errors/ApiError";

const sendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return next(new ApiError(400, "Kullanıcı bulunamadı"));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const verificationUrl = `https://localhost:3000/api/verify-email?token=${token}`;

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

  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: email,
    subject: "Email Onayı",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <thead style="background-color: #007bff; color: #ffffff; text-align: center; padding: 10px;">
            <tr>
              <th style="padding: 20px; font-size: 24px;">Email Onayı</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 20px; text-align: center; font-size: 16px;">
                <p>Hello,</p>
                <p>Kayıt olduğunuz için teşekkür ederiz. Lütfen alttaki bağlantıya tıklayıp hesabınızı onaylayın.</p>
                <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; font-size: 16px; border-radius: 5px; margin-top: 10px;">Verify Email</a>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">If you didn’t create this account, you can safely ignore this email.</p>
              </td>
            </tr>
          </tbody>
          <tfoot style="background-color: #f1f1f1; text-align: center; padding: 10px;">
            <tr>
              <td style="font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} TURKOTREND. Tüm Hakları Saklıdır.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`JWT Token: ${token}`); //bitince silinecek
    next();
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Doğrulama e-postası gönderilemedi"));
  }
};

export default sendVerificationEmail;
