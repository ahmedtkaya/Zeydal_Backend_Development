import nodemailer from "nodemailer";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import PaymentSuccess from "../db/payment-success";

const sendCanceledOrderEmail = async (req, res, next) => {
  // const payment_success = await PaymentSuccess.findOne({ payment_success_id });
  // const payment_success_id = req.payment_success?.id;
  const email = req.user?.email;
  const user = await Users.findOne({ email });

  if (!user) {
    return next(new ApiError(400, "Kullanıcı bulunamadı"));
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "atkahmed9924@gmail.com", //yandex mail yazılacak
      pass: "pwyh yojo pdaw welz", // gmail uygulama şifresi bölümünden alındı yandex nasıl oluyor öğren ve uygula
    },
  });

  const mailOptions = {
    from: "atkahmed9924@gmail.com",
    to: email,
    subject: "Sipariş İptali",
    html: `
    <p>Merhaba ${user.name},</p>
    <p>Siparişiniz iptal edilmiştir.</p>
           <p>Teşekkür ederiz</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    next();
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Doğrulama e-postası gönderilemedi"));
  }
};

export default sendCanceledOrderEmail;
