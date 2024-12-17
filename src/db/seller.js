import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import generatedId from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const randomColorGenerator = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};
// const DocumentsEnum = [
//   "vergi_levhasi",
//   "isletme_kayit_belgesi",
//   "sicil_gazetesi",
//   "diger",
// ];

const DocumentSchema = new Schema(
  {
    sicil_gazetesi: {
      type: String,
      // required: true,
    },
    vergi_levhasi: {
      type: String,
      // required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);
const SellerSchema = new Schema(
  {
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
      // required: true,
      default: "seller",
      enum: ["user", "admin", "seller"],
    },
    subMerchantExternalId: {
      type: String,
      // required: true,
      default: generatedId(),
    },
    subMerchantType: {
      type: String,
      enum: ["PRIVATE_COMPANY", "LIMITED_OR_JOINT_STOCK_COMPANY"],
      // default: "PRIVATE_COMPANY",
      // required: true,
    },
    currency: {
      type: String,
      default: "TRY",
      enum: ["TRY", "USD", "EUR", "GBP", "RUB", "CHF", "NOK"],
    },
    identityNumber: {
      type: String,
      // minlength: 11,
      // maxlength: 11,
      required: function () {
        return this.subMerchantType === "PRIVATE_COMPANY";
      },
      unique: true,
    },
    taxNumber: {
      type: String,
      required: function () {
        return this.subMerchantType === "LIMITED_OR_JOINT_STOCK_COMPANY";
      },
      unique: true,
    },
    name: {
      type: String,
      // required: true,
    },
    gsmNumber: {
      type: String,
      // minlength: 12,
      // maxlength: 12,
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      // required: true,
    },
    taxOffice: {
      type: String,
      // required: true,
    },
    legalCompanyTitle: {
      type: String,
      // required: true,
    },
    iban: {
      type: String,
      // required: true,
      unique: true,
      // minlength: 26,
      // maxlength: 26,
    },
    address: {
      type: String,
      // required: true,
    },
    avatarColor: {
      type: String,
      default: randomColorGenerator(),
      // required: true,
    },
    logo: {
      type: String,
      // required: false,
    },
    products: {
      type: ObjectId,
      ref: "Products",
    },
    documents: {
      type: [DocumentSchema],
      // required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subMerchantKey: {
      type: String,
      unique: true,
    },
  },
  {
    _id: true,
    collection: "seller",
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        return {
          ...ret,
        };
      },
    },
  }
);

SellerSchema.pre("save", async function (next) {
  try {
    if (!this.gsmNumber.startsWith("+90") && !this.iban.startsWith("TR")) {
      this.iban = `TR${this.iban}`;
      this.gsmNumber = `+90${this.gsmNumber}`;
    }
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
const Sellers = mongoose.model("Sellers", SellerSchema);

export default Sellers;
