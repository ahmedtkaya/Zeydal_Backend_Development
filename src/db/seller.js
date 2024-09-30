import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import generatedId from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const randomColorGenerator = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const SellerSchema = new Schema(
  {
    uuid: {
      type: String,
      default: generatedId(),
      unique: true,
      required: true,
    },
    locale: {
      type: String,
      required: true,
      default: "tr",
      enum: ["tr", "en"],
    },
    role: {
      type: String,
      required: true,
      default: "seller",
      enum: ["user", "admin", "seller"],
    },
    SellerName: {
      type: String,
      required: true,
    },
    SellerEmail: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    SellerPassword: {
      type: String,
      required: true,
    },
    avatarColor: {
      type: String,
      default: randomColorGenerator(),
      required: true,
    },
    SellerLogo: {
      type: String,
      required: false,
    },
    documents: {
      type: [String],
      required: true,
    },
    products: {
      type: ObjectId,
      ref: "Products",
    },
    address: {
      //fatura ve sipariş adresi diye ikiye ayrılabilir
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "Turkey",
    },
    zipCode: {
      type: String,
      required: true,
      default: "00000",
    },
    ip: {
      type: String,
      required: true,
      //default: "85.34.78.112", //cihazın ip'sini alır
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    // this.password = await bcrypt.hash(this.password, 10);
    if (this.isModified("SellerPassword")) {
      //password incorrect hatasını böyle çözdük
      this.SellerPassword = await bcrypt.hash(this.SellerPassword, 10);
    }
    return next();
  } catch (err) {
    return next(err);
  }
  next();
});
const Sellers = mongoose.model("Sellers", SellerSchema);

export default Sellers;
