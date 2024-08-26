import nodemailer from "nodemailer";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import PaymentSuccess from "../db/payment-success";
import Carts from "../db/cart";

const sendCanceledOrderEmail = async (req, res, next) => {
  const email = req.user?.email;
  const user = await Users.findOne({ email });
  const cart = await Carts.findOne({ buyer: user._id })
    .populate("products")
    .sort({ createdAt: -1 });

  if (!user) {
    return next(new ApiError(400, "Can not find user"));
  }
  const payment = await PaymentSuccess.findOne({ cartId: user._id })
    .populate("products")
    .sort({ createdAt: -1 });

  if (!cart) {
    throw new ApiError("Can not find cart", 400, "canNotFindCart");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "atkahmed9924@gmail.com", //yandex mail yazılacak
      pass: "pwyh yojo pdaw welz", // gmail uygulama şifresi bölümünden alındı
    },
  });
  console.log(cart.products); // Tüm ürünlerin bu array içinde olup olmadığını kontrol edin

  const productsList = cart.products
    .map(
      (product) => `
      <div style="margin-bottom: 20px;">
      <img src="${product.images}" alt="${product.name}" style="max-width: 200px; height: auto;" />
      <p>Ürün Adı: ${product.name}</p>
      <p>Ürün Markası: ${product.brand}</p>
      <p>Ürün Fiyatı: ${product.price}</p>
    </div>
    <hr>
  `
    )
    .join("");
  console.log(productsList);

  const totalPrice = cart.products.reduce(
    (total, product) => total + product.price,
    0
  );

  const mailOptions = {
    from: "atkahmed9924@gmail.com",
    to: email,
    subject: "Siparişiniz İptal Edildi",
    html: `
    <p>Merhaba ${user.name},</p>
    <p>${payment.paymentId} numaralı Siparişiniz İptal Edilmiştir.</p>
    ${productsList}
    <p><strong>Toplam Fiyat: ${totalPrice} TL</strong></p>
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

export default sendCanceledOrderEmail;
