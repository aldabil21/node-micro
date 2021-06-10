import { Document, Model, model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
  email: string;
  password: string;
}

interface UserModel extends Model<Userdoc> {
  add(user: IUser): Userdoc;
  comparePassword(pass: string, hashed: string): Promise<boolean>;
}

export interface Userdoc extends Document {
  id: string;
  email: string;
  password: string;
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

// Helpers/Middlewares
UserSchema.statics.add = function (user: IUser) {
  return new User(user);
};
UserSchema.pre("save", async function (this: Userdoc, next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
  }
  next();
});
UserSchema.statics.comparePassword = async function (
  password: string,
  hashed: string
) {
  return bcrypt.compare(password, hashed);
};

const User = model<Userdoc, UserModel>("User", UserSchema);

export { User };
