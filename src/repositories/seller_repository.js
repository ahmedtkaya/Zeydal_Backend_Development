import Seller from "../db/seller";
import ApiError from "../errors/ApiError";
import {
  updateLimitedOrJointSubMerchant,
  updatePrivateSubMerchant,
} from "../services/iyzico/methods/submerchant";

export const updateSellerInDatabase = async ({
  seller,
  name,
  gsmNumber,
  iban,
  address,
  logoPath,
}) => {
  const {
    subMerchantType,
    subMerchantKey,
    email,
    legalCompanyTitle,
    taxOffice,
    taxNumber,
    identityNumber,
  } = seller;

  if (!subMerchantType) {
    throw new ApiError(
      "Merchant type not found",
      400,
      "missingSubMerchantType"
    );
  }

  // gsmNumber kontrolü
  if (gsmNumber) {
    const existingSeller = await Seller.findOne({ gsmNumber });
    if (
      existingSeller &&
      existingSeller._id.toString() !== seller._id.toString()
    ) {
      throw new ApiError(
        "This phone number is already in use",
        400,
        "phoneNumberAlreadyUsing"
      );
    }
  }

  // Güncellenecek alanlar
  const updateFields = {
    ...(name && { name }),
    ...(gsmNumber && { gsmNumber }),
    ...(iban && { iban }),
    ...(address && { address }),
    subMerchantKey,
    email,
    legalCompanyTitle,
    taxNumber,
    taxOffice,
    identityNumber,
  };

  if (logoPath) {
    updateFields.logo = logoPath;
  }

  // İyzico API çağrısı: Şirket tipine göre uygun method
  let iyzicoResponse;
  let updateSeller = null;

  if (subMerchantType === "PRIVATE_COMPANY") {
    iyzicoResponse = await updatePrivateSubMerchant(updateFields);
  } else if (subMerchantType === "LIMITED_OR_JOINT_STOCK_COMPANY") {
    iyzicoResponse = await updateLimitedOrJointSubMerchant(updateFields);
  } else {
    throw new ApiError("Invalid company type", 400, "invalidCompanyType");
  }

  // Yerel veritabanında satıcıyı güncelle
  if (iyzicoResponse.status === "success") {
    const updateSeller = await Seller.findByIdAndUpdate(
      seller._id,
      updateFields,
      { new: true }
    );
    if (!updateSeller) {
      throw new ApiError("Seller not found", 400, "notFoundSeller");
    }
  } else {
    console.log(
      "iyzico tarafında success olmadığı için veritabanında güncelleme olmamıştır."
    );
  }

  return { updateSeller, iyzicoResponse };
};
