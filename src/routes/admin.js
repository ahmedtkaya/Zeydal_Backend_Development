import Seller from "../db/seller";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import { noExistVariable, notFoundVariable } from "../helpers/CheckExistence";
import { checkPermissions } from "../helpers/Permissions";
import {
  ApproveMailToSeller,
  RejectMailToSeller,
} from "../middlewares/ApproveMailToSeller";
import Session from "../middlewares/Session";
import { createSubMerchant } from "../services/iyzico/methods/submerchant";

export default (router) => {
  // Onay bekleyen seller'ları listeleme
  router.get("/admin/seller/pending", Session, async (req, res) => {
    checkPermissions(req.user, ["admin"]);
    try {
      const pendingSellers = await Seller.find({ isVerified: false });
      // if (!pendingSellers) {
      //   throw new ApiError("Does not exist seller pending");
      // }
      noExistVariable(pendingSellers, "Seller");
      return res.status(200).json(pendingSellers);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(new ApiError(500, "Satıcılar listelenirken hata oluştu."));
    }
  });

  router.put("/admin/seller/verify/:id", Session, async (req, res, next) => {
    const { id } = req.params;
    const { action, response } = req.body;

    try {
      checkPermissions(req.user, ["admin"]); // Yetki kontrolü
      const seller = await Seller.findById(id);
      notFoundVariable(seller, "Seller"); // Satıcı var mı kontrolü

      if (seller.isVerified) {
        return next(
          new ApiError(
            "This seller is already verified",
            404,
            "alreadyVerified"
          )
        );
      }

      if (action === "approve") {
        // Satıcı bilgilerini iyzico'ya uygun formata çevir
        const subMerchantData = {
          locale: seller.locale,
          conversationId: seller.conversationId,
          subMerchantExternalId: seller.subMerchantExternalId,
          subMerchantType: seller.subMerchantType,
          address: seller.address,
          taxOffice: seller.taxOffice,
          legalCompanyTitle: seller.legalCompanyTitle,
          email: seller.email,
          gsmNumber: seller.gsmNumber,
          name: seller.name,
          //şundan itibaren bakıver tax ve buna
          identityNumber:
            seller.subMerchantType === "PRIVATE_COMPANY"
              ? seller.identityNumber
              : undefined,
          taxNumber:
            seller.subMerchantType === "LIMITED_OR_JOINT_STOCK_COMPANY"
              ? seller.taxNumber
              : undefined,
          iban: seller.iban.trim(),
          currency: seller.currency,
        };
        console.log("Kaydedilen IBAN:", seller.iban);
        console.log("Data = ", subMerchantData);

        try {
          const iyzicoResult = await createSubMerchant(subMerchantData);

          if (iyzicoResult.status === "success") {
            console.log(iyzicoResult);
            seller.subMerchantKey = iyzicoResult.subMerchantKey;
            seller.isVerified = true;
            await seller.save();
            await ApproveMailToSeller(req, res, next); // Onay e-postası gönder

            return res.status(200).json({
              message: "Seller is verified and registered in iyzico",
              seller,
            });
          } else {
            // İyzico hatası loglanıyor
            console.log("Iyzipay Error:", iyzicoResult);
            return res.status(500).json({
              status: "Failed to register seller in iyzico",
              rawResponse: iyzicoResult,
            });
          }
        } catch (error) {
          console.log("Iyzipay API Error:", error);
          return res.status(500).json({
            status: "Failed to register seller in iyzico",
            error:
              error.message || "An error occurred while contacting Iyzipay",
          });
        }
      }

      if (action === "reject") {
        await RejectMailToSeller(req, res, async () => {
          // Mail başarılı bir şekilde gönderilirse satıcıyı sil
          await Seller.findByIdAndDelete(id);
          return res
            .status(200)
            .json({ message: "Seller is rejected and deleted" });
        });

        // Burada erken return yaparak hata olmasını engelliyoruz
        return;
      }

      return res.status(400).json(new ApiError(400, "Invalid transaction"));
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500,
          "There is an error while processing the verification transaction"
        )
      );
    }
  });

  router.get("/admin/get-all-users", Session, async (req, res) => {
    checkPermissions(req.user, ["admin"]);

    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "There must be error while get all users",
        404,
        "errorGetAllUsers"
      );
    }
  });

  router.get("/admin/get-all-sellers", Session, async (req, res) => {
    checkPermissions(req.user, ["admin"]);
    try {
      const sellers = await Seller.find().select("-SellerPassword");
      res.status(200).json(sellers);
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "There must be error while get all sellers",
        404,
        "errorGetAllSellers"
      );
    }
  });
};
