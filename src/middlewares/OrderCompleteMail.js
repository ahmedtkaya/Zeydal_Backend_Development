import nodemailer from "nodemailer";
import Users from "../db/users";
import Carts from "../db/cart";
import ApiError from "../errors/ApiError";

const sendCompletedOrderEmail = async (req, res, next) => {
  const email = req.user?.email;
  const user = await Users.findOne({ email });

  if (!user) {
    return next(new ApiError(400, "Can not find user"));
  }
  const cart = await Carts.findOne({ buyer: user._id })
    .populate("products")
    .sort({ createdAt: -1 });

  if (!cart) {
    throw new ApiError("Can not find cart", 400, "canNotFindCart");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_SENDER, //yandex mail yazılacak
      pass: process.env.MAIL_SENDER_PASSWORD, // gmail uygulama şifresi bölümünden alındı
    },
  });

  console.log(cart.products); // Tüm ürünlerin bu array içinde olup olmadığını kontrol edin
  console.log("mail", process.env.MAIL_SENDER);
  console.log("password", process.env.MAIL_SENDER_PASSWORD);

  const productsList = cart.products
    .map(
      (product) => `
      <div style="margin-bottom: 20px;">
      <img src="https://localhost:3000/public/images/${product.images[0]}" alt="${product.name}" style="max-width: 200px; height: auto;" />
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
    from: process.env.MAIL_SENDER,
    to: email,
    subject: "Siparişiniz alındı",
    html: `
    <p>Merhaba ${user.name},</p>
    <p>${cart.uuid} numaralı Siparişiniz alındı, En kısa zamanda kargoya verilecektir.</p>
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

export default sendCompletedOrderEmail;
