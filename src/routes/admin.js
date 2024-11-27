import ApprovalOrders from "../db/approval-orders";
import DisApprovalOrders from "../db/disapproval-orders";
import PaymentSuccess from "../db/payment-success";
import Seller from "../db/seller";
import Users from "../db/users";
import ApiError from "../errors/ApiError";
import { noExistVariable, notFoundVariable } from "../helpers/CheckExistence";
import { checkPermissions } from "../helpers/Permissions";
import { checkRequiredField } from "../helpers/RequiredCheck";
import {
  ApproveMailToSeller,
  RejectMailToSeller,
} from "../middlewares/ApproveMailToSeller";
import Session from "../middlewares/Session";
import {
  approvePayment,
  disApprovePayment,
} from "../services/iyzico/methods/approval";
import {
  createSubMerchant,
  getSubMerchant,
} from "../services/iyzico/methods/submerchant";

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
      const sellers = await Seller.find().select("-password");
      const sellersWithSubMerchants = await Promise.all(
        sellers.map(async (seller) => {
          try {
            const subMerchant = await getSubMerchant({
              locale: seller.locale || "tr",
              conversationId: seller.conversationId,
              subMerchantExternalId: seller.subMerchantExternalId,
            });
            return {
              subMerchant,
            };
          } catch (error) {
            console.error(
              `SubMerchant data could not be retrieved for seller: ${seller._id}`,
              error
            );
            return {
              ...seller.toObject(),
              subMerchant: null,
            };
          }
        })
      );

      res.status(200).json({ sellers: sellersWithSubMerchants });
    } catch (error) {
      console.log(error);
      throw new ApiError(
        "There must be error while get all sellers",
        404,
        "errorGetAllSellers"
      );
    }
  });
  router.post("/admin/approve-order", Session, async (req, res) => {
    const { paymentTransactionId } = req.body;
    checkRequiredField(paymentTransactionId, "PaymentTransactionId");

    const data = {
      paymentTransactionId,
    };

    try {
      const result = await approvePayment(data);
      // Update isApprove field in payment-success collection
      const updateResult = await PaymentSuccess.updateOne(
        { "itemTransactions.paymentTransactionId": paymentTransactionId }, // Locate the document with the specified transaction ID
        { $set: { "itemTransactions.$.isApprove": true } } // Set isApprove to true for the matching item
      );

      // Check if any document was modified
      if (updateResult.modifiedCount === 0) {
        throw new ApiError(
          "No matching transaction found or it was already approved",
          404,
          "transactionNotFound"
        );
      }

      const payment = await PaymentSuccess.findOne(
        { "itemTransactions.paymentTransactionId": paymentTransactionId },
        "itemTransactions cartId"
      ).populate("itemTransactions.itemId", "name price");

      const transaction = payment.itemTransactions.find(
        (item) => item.paymentTransactionId === paymentTransactionId
      );

      if (!transaction) {
        throw new ApiError("Transaction not found", 404, "transactionNotFound");
      }

      // Create an ApprovedOrder record for the transaction
      const approvedOrderData = {
        paymentTransactionId: transaction.paymentTransactionId,
        itemId: transaction.itemId._id,
        name: transaction.itemId.name,
        price: transaction.itemId.price,
        paidPrice: transaction.paidPrice,
        cartId: payment.cartId,
      };

      // Save the approved order to ApprovedOrders collection
      const approvedOrder = await ApprovalOrders.create(approvedOrderData);
      res.status(200).json({ result, approvedOrder });
    } catch (error) {
      console.log(error);
    }
  });
  router.post("/admin/disapprove-order", Session, async (req, res) => {
    const { paymentTransactionId } = req.body;
    checkRequiredField(paymentTransactionId, "PaymentTransactionId");

    const data = {
      paymentTransactionId,
    };

    try {
      const result = await disApprovePayment(data);
      // Update isApprove field in payment-success collection
      const updateResult = await PaymentSuccess.updateOne(
        { "itemTransactions.paymentTransactionId": paymentTransactionId }, // Locate the document with the specified transaction ID
        {
          $set: {
            "itemTransactions.$.isDisApprove": true,
            "itemTransactions.$.isApprove": false,
          },
        } // Set isApprove to true for the matching item
      );

      // Check if any document was modified
      if (updateResult.modifiedCount === 0) {
        throw new ApiError(
          "No matching transaction found or it was already approved",
          404,
          "transactionNotFound"
        );
      }

      const payment = await PaymentSuccess.findOne(
        { "itemTransactions.paymentTransactionId": paymentTransactionId },
        "itemTransactions cartId"
      ).populate("itemTransactions.itemId", "name price");

      const transaction = payment.itemTransactions.find(
        (item) => item.paymentTransactionId === paymentTransactionId
      );

      if (!transaction) {
        throw new ApiError("Transaction not found", 404, "transactionNotFound");
      }

      // Create an ApprovedOrder record for the transaction
      const disApprovedOrderData = {
        paymentTransactionId: transaction.paymentTransactionId,
        itemId: transaction.itemId._id,
        name: transaction.itemId.name,
        price: transaction.itemId.price,
        paidPrice: transaction.paidPrice,
        cartId: payment.cartId,
      };

      // Save the approved order to ApprovedOrders collection
      const disApprovedOrder = await DisApprovalOrders.create(
        disApprovedOrderData
      );
      res.status(200).json({ result, disApprovedOrder });
    } catch (error) {
      console.log(error);
    }
  });
  router.get("/admin/waiting-orders", Session, async (req, res, next) => {
    try {
      const payments = await PaymentSuccess.find(
        {
          status: "success",
          itemTransactions: {
            $elemMatch: { isApprove: false, isDisApprove: false },
          },
        },
        "itemTransactions"
      ).populate("itemTransactions.itemId", "name price"); // Populate name and price from the product collection

      // Prepare an array of transaction details
      const transactionDetails = payments.flatMap((payment) =>
        payment.itemTransactions
          .filter(
            (transaction) => !transaction.isApprove && !transaction.isDisApprove
          )
          .map((transaction) => ({
            paymentTransactionId: transaction.paymentTransactionId,
            itemId: transaction.itemId._id, // The ObjectId of the item
            name: transaction.itemId.name, // Populated name of the item
            price: transaction.itemId.price, // Populated price of the item
          }))
      );
      if (transactionDetails.length === 0) {
        console.log("there is no order to approve");
        throw new ApiError(
          "There is no order to approve",
          401,
          "noOrderToApprove"
        );
      }

      res.status(200).json({ transactionDetails });
    } catch (error) {
      console.log(error);
      next(
        new ApiError(
          "Could not retrieve paymentTransactionIds",
          500,
          "fetchError"
        )
      );
    }
  });
};
