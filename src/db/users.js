import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import generatedId from "../utils/uuid";

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const randomColorGenerator = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const UserSchema = new Schema({});

UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (err) {
    return next(err);
  }
  next();
});
const Users = mongoose.model("Users", UserSchema);

export default Users;
