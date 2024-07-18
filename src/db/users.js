import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import generatedId from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const randomColorGenerator = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const UserSchema = new Schema(
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
      default: "user",
      enum: ["user", "admin"],
    },
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    identityNumber: {
      type: String,
      required: true,
      default: "00000000000",
    },
    password: {
      type: String,
      required: true,
    },
    avatarColor: {
      type: String,
      default: randomColorGenerator(),
      required: true,
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
    cardUserKey: {
      type: String,
      required: false,
      unique: true,
    },
  },
  {
    _id: true,
    collection: "users",
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

UserSchema.pre("save", async function (next) {
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
const Users = mongoose.model("Users", UserSchema);

export default Users;
