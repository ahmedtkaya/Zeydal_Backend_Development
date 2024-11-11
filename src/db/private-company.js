const mongoose = require("mongoose");
import bcrypt from "bcryptjs";
import generatedId from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const randomColorGenerator = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const privateCompanySellerSchema = new Schema({
  locale: {
    type: String,
    default: "tr",
  },
  conversationId: {
    type: String,
    default: generatedId(),
  },
  role: {
    type: String,
    required: true,
    default: "seller",
    enum: ["user", "admin", "seller"],
  },
  subMerchantExternalId: {
    type: String,
    required: true,
    default: generatedId(),
  },
  subMerchantType: {
    type: String,
    enum: ["PRIVATE_COMPANY", "LIMITED_OR_JOINT_STOCK_COMPANY"],
    // default: "PRIVATE_COMPANY",
    required: true,
  },
  currency: {
    type: String,
    default: "TRY",
    enum: ["TRY", "USD", "EUR", "GBP", "RUB", "CHF", "NOK"],
  },
  identityNumber: {
    type: String,
    minlength: 11,
    maxlength: 11,
    required: function () {
      return this.subMerchantType === "PRIVATE_COMPANY";
    },
  },
  taxNumber: {
    type: String,
    required: function () {
      return this.subMerchantType === "LIMITED_OR_JOINT_STOCK_COMPANY";
    },
  },
  name: {
    type: String,
    required: true,
  },
  gsmNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  taxOffice: {
    type: String,
    required: true,
  },
  legalCompanyTitle: {
    type: String,
    required: true,
  },
  iban: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  avatarColor: {
    type: String,
    default: randomColorGenerator(),
    required: true,
  },
  logo: {
    type: String,
    required: false,
  },
  products: {
    type: ObjectId,
    ref: "Products",
  },
  documents: {
    type: [String],
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

privateCompanySellerSchema.pre("save", async function (next) {
  try {
    // this.password = await bcrypt.hash(this.password, 10);
    if (this.isModified("password")) {
      //password incorrect hatasını böyle çözdük
      this.password = await bcrypt.hash(this.password, 10);
    }
    return next();
  } catch (err) {
    return next(err);
  }
  next();
});

const PrivateCompanySeller = mongoose.model(
  "PrivateCompanySeller",
  privateCompanySellerSchema
);

module.exports = PrivateCompanySeller;
