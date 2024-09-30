import nodemailer from "nodemailer";
import Users from "../db/users";
import Carts from "../db/cart";
import Products from "../db/products"; // Products modelini ekleyin
import ApiError from "../errors/ApiError";

const sendCompletedOrderEmail = async (req, res, next) => {
  const email = req.user?.email;
  const user = await Users.findOne({ email });

  if (!user) {
    return next(new ApiError(400, "Can not find user"));
  }

  // En son oluşturulan sepeti buluyoruz
  const cart = await Carts.findOne({ buyer: user._id }).sort({ createdAt: -1 });

  if (!cart) {
    throw new ApiError("Can not find cart", 400, "canNotFindCart");
  }

  // Cart içindeki productId'leri ve miktarları kullanarak ürün detaylarını çekiyoruz
  const productIds = cart.products.map((item) => item.productId);
  const products = await Products.find({ _id: { $in: productIds } }).populate(
    "seller",
    "SellerName"
  );

  // Sepet içindeki ürünlerin detaylarını zenginleştiriyoruz
  const enrichedProducts = cart.products.map((cartProduct) => {
    const productDetail = products.find(
      (product) => String(product._id) === String(cartProduct.productId)
    );
    return {
      ...cartProduct._doc,
      productDetail,
    };
  });

  // Ürünlerin HTML formatında listesini oluşturuyoruz
  const productsList = enrichedProducts
    .map(
      (cartProduct) => `
      <div style="margin-bottom: 20px;">
        <img src="https://localhost:3000/public/images/${
          cartProduct.productDetail.images
        }" alt="${
        cartProduct.productDetail.name
      }" style="max-width: 200px; height: auto;" />
        <p>Ürün Adı: ${cartProduct.productDetail.name}</p>
        <p>Ürün Markası: ${cartProduct.productDetail.seller?.SellerName}</p>
        <p>Adet: ${cartProduct.quantity}</p>
        <p>Ürün Fiyatı: ${cartProduct.productDetail.price} TL</p>
        <p>Toplam: ${(
          cartProduct.productDetail.price * cartProduct.quantity
        ).toFixed(2)} TL</p>
      </div>
      <hr>
    `
    )
    .join("");

  // Toplam fiyatı hesaplıyoruz (ürün fiyatı * adet)
  const totalPrice = enrichedProducts
    .map((product) => product.productDetail.price * product.quantity)
    .reduce((total, price) => total + price, 0)
    .toFixed(2);

  // E-posta gönderimi için mail transporter oluşturuyoruz
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_SENDER_PASSWORD,
    },
  });

  // Gönderilecek e-posta içeriğini hazırlıyoruz
  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: email,
    subject: "Siparişiniz alındı",
    html: `
      <p>Merhaba ${user.name},</p>
      <p>${cart.uuid} numaralı siparişiniz alındı, en kısa zamanda kargoya verilecektir.</p>
      ${productsList}
      <p><strong>Toplam Fiyat: ${totalPrice} TL</strong></p>
      <p>Teşekkür ederiz</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Doğrulama e-postası gönderilemedi"));
  }
};

export default sendCompletedOrderEmail;
