import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import getUserIp from "../middlewares/getUserIP";

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
    service: "gmail",
    auth: {
      user: "atkahmed9924@gmail.com", //yandex mail yazılacak
      pass: "pwyh yojo pdaw welz", // gmail uygulama şifresi bölümünden alındı
    },
  });

  const mailOptions = {
    from: "atkahmed9924@gmail.com",
    to: email,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">Verify Email</a>`,
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
