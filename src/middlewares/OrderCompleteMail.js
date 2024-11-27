import nodemailer from "nodemailer";
import Carts from "../db/cart";
import Products from "../db/products"; // Products modelini ekleyin
import Users from "../db/users";
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
    .map((cartProduct) => {
      const productDetail = cartProduct.productDetail;
      return `
    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; background-color: #f9f9f9;">
      <img src="https://localhost:3000/public/images/${
        productDetail.images
      }" alt="${
        productDetail.name
      }" style="max-width: 100px; height: auto; border-radius: 5px; margin-right: 15px;" />
      <div style="flex-grow: 1;">
        <h4 style="margin: 0; font-size: 16px; color: #333;">${
          productDetail.name
        }</h4>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">Marka: ${
          productDetail.seller?.SellerName //name olacak
        }</p>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">Adet: ${
          cartProduct.quantity
        }</p>
        <p style="margin: 5px 0; font-size: 14px; color: #666;">Fiyat: ${
          productDetail.price
        } TL</p>
        <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Toplam: ${(
          productDetail.price * cartProduct.quantity
        ).toFixed(2)} TL</strong></p>
      </div>
    </div>
    <hr style="border: 1px solid #e0e0e0;">
  `;
    })
    .join("");

  // Toplam fiyatı hesaplıyoruz (ürün fiyatı * adet)
  const totalPrice = enrichedProducts
    .map((product) => product.productDetail.price * product.quantity)
    .reduce((total, price) => total + price, 0)
    .toFixed(2);

  // E-posta gönderimi için mail transporter oluşturuyoruz
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

  // Gönderilecek e-posta içeriğini hazırlıyoruz
  const mailOptions = {
    from: `"TURKOTREND" <${process.env.MAIL_SENDER}>`,
    to: email,
    subject: "Siparişiniz alındı",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; background-color: #fafafa;">
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://example.com/logo.png" alt="Logo" style="max-width: 150px;">
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333333; text-align: center;">Siparişiniz Başarıyla Alındı!</h2>
        <p style="font-size: 16px; color: #555555; text-align: center;">Merhaba <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; color: #555555; text-align: center;">
          <strong>${cart.uuid}</strong> numaralı siparişiniz alındı ve en kısa zamanda kargoya verilecektir.
        </p>

        <div style="margin: 20px 0;">
          <h3 style="font-size: 18px; color: #333333; text-align: center;">Sipariş Detayları:</h3>
          ${productsList}
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 5px solid #17a2b8; border-radius: 5px;">
          <p style="margin: 0; font-size: 16px; text-align: center;">
            <strong>Toplam Tutar: ${totalPrice} TL</strong>
          </p>
        </div>

        
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 14px; color: #999999;">Sorularınız için bize ulaşmaktan çekinmeyin.</p>
        <p style="font-size: 14px; color: #999999;">© 2024 TURKOTREND. Tüm hakları saklıdır.</p>
      </div>
    </div>
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
