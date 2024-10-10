import nodemailer from "nodemailer";
import Seller from "../db/seller";
import ApiError from "../errors/ApiError";

const ApproveMailToSeller = async (req, res, next) => {
  const { id } = req.params; // middleware endpointe bağlı olduğu için endpointteki params'ı çekebiliyoruz
  const seller = await Seller.findById(id);
  if (!seller) {
    throw new ApiError("Seller not found", 404, "noExistSeller");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_SENDER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: seller.SellerEmail,
    subject: "Hesabınız onaylandı",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; background-color: #fafafa;">
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://example.com/logo.png" alt="Logo" style="max-width: 150px;">
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333333; text-align: center;">Tebrikler, Hesabınız Onaylandı!</h2>
        <p style="font-size: 16px; color: #555555; text-align: center;">Merhaba <strong>${seller.SellerName}</strong>,</p>
        <p style="font-size: 16px; color: #555555; text-align: center;">
          Hesabınız başarıyla onaylanmıştır ve artık platformumuzu kullanabilirsiniz.
        </p>
        
        <div style="background-color: #d4edda; color: #155724; padding: 15px; margin: 20px 0; border-left: 5px solid #c3e6cb; border-radius: 5px;">
          <p style="margin: 0; text-align: center;"><strong>Hesabınız artık aktif!</strong> Platformda satış yapmaya başlayabilirsiniz.</p>
        </div>
        
        <p style="font-size: 16px; color: #555555; text-align: center;">
          Bizimle çalışmayı tercih ettiğiniz için teşekkür ederiz. Başarınız için buradayız.
        </p>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://example.com/dashboard" style="background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Kontrol Paneline Git</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 14px; color: #999999;">Herhangi bir sorunuz varsa, bize ulaşmaktan çekinmeyin.</p>
        <p style="font-size: 14px; color: #999999;">© 2024 TURKOTREND. Tüm hakları saklıdır.</p>
      </div>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return next();
  } catch (error) {
    console.log(error);
    return json(new ApiError(500, "Doğrulama e postası gönderilemedi."));
  }
};

const RejectMailToSeller = async (req, res, next) => {
  const { id } = req.params; // middleware endpointe bağlı olduğu için endpointteki params'ı çekebiliyoruz
  const { response } = req.body;
  const seller = await Seller.findById(id);
  if (!seller) {
    throw new ApiError("Seller not found", 404, "noExistSeller");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_SENDER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: seller.SellerEmail,
    subject: "Hesabınız reddedildi",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; background-color: #fafafa;">
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://example.com/logo.png" alt="Logo" style="max-width: 150px;">
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333333; text-align: center;">Hesabınız Reddedildi</h2>
        <p style="font-size: 16px; color: #555555; text-align: center;">Merhaba <strong>${seller.SellerName}</strong>,</p>
        <p style="font-size: 16px; color: #555555; text-align: center;">Hesabınızın reddedildiğini üzülerek bildiriyoruz.</p>
        
        <div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin: 20px 0; border-left: 5px solid #f5c6cb; border-radius: 5px;">
          <p style="margin: 0;"><strong>Reddetme Nedeni:</strong> ${response}</p> <!-- Dinamik response burada -->
        </div>
        
        <p style="font-size: 16px; color: #555555; text-align: center;">
          Eksik bilgilerinizi tamamladıktan sonra lütfen yeniden kayıt olun. Yardımcı olmaktan memnuniyet duyarız.
        </p>
        
        <p style="font-size: 16px; color: #555555; text-align: center;">Bizimle çalıştığınız için teşekkür ederiz.</p>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://example.com/reapply" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Tekrar Başvur</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 14px; color: #999999;">Bu e-postayı aldıysanız ancak başvuruda bulunmadıysanız lütfen bizimle iletişime geçin.</p>
        <p style="font-size: 14px; color: #999999;">© 2024 TURKOTREND. Tüm hakları saklıdır.</p>
      </div>
    </div>
  `,
  };
  try {
    await transporter.sendMail(mailOptions);
    return next();
  } catch (error) {
    console.log(error);
    return json(new ApiError(500, "Doğrulama e postası gönderilemedi."));
  }
};

export { ApproveMailToSeller, RejectMailToSeller };
