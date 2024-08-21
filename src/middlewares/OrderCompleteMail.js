import nodemailer from "nodemailer";
import Users from "../db/users";
import ApiError from "../errors/ApiError";

const sendCompletedOrderEmail = async (req, res, next) => {
  const email = req.user?.email;
  const user = await Users.findOne({ email });

  if (!user) {
    return next(new ApiError(400, "Kullanıcı bulunamadı"));
  }

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
    subject: "Siparişiniz alındı",
    html: `
    <p>Merhaba ${user.name},</p>
    <p>Siparişiniz alındı, En kısa zamanda kargoya verilecektir.</p>
           <p>Teşekkür ederiz</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // next();
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Doğrulama e-postası gönderilemedi"));
  }
};

export default sendCompletedOrderEmail;
