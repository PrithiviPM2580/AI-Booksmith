// ============================================================
// 🧩 UserModel — User data model and schema definition
// ============================================================
import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";
import bcrypt from "bcrypt";

// ------------------------------------------------------
// Define User Interface
// ------------------------------------------------------
export interface IUser {
  __id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isPro?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Method that every document can cal
export interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// Document and Mode type
export type UserDocument = HydratedDocument<IUser>;
export type UserModelType = Model<IUser, Record<string, never>, IUserMethods>;
export type UserObject = IUser;

// ------------------------------------------------------
// Define User Schema
// ------------------------------------------------------
const userSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    __id: { type: Schema.Types.ObjectId, required: true, auto: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true, select: false },
    avatarUrl: { type: String, default: null },
    isPro: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------------
// Hash Password before saving
// ------------------------------------------------------
userSchema.pre<UserDocument>("save", async function () {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return;

  // generate a salt
  const salt = await bcrypt.genSalt(10);

  // hash the password using our new salt
  this.password = await bcrypt.hash(this.password, salt);
});

// ------------------------------------------------------
// Method to compare passwords
// ------------------------------------------------------
userSchema.method(
  "comparePassword",
  async function (enteredPassword: string): Promise<boolean> {
    // it return true if passwords match else false
    return await bcrypt.compare(enteredPassword, this.password);
  }
);

// ------------------------------------------------------
// Virtuals (it will not be stored in DB and sued to query and populate data)
// ------------------------------------------------------
userSchema.virtual("books", {
  ref: "Book",
  localField: "__id",
  foreignField: "userId",
});

userSchema.virtual("refreshTokens", {
  ref: "RefreshToken",
  localField: "__id",
  foreignField: "userId",
});

userSchema.set("toObject", {
  virtuals: true,
});

// ------------------------------------------------------
// Transform output (remove password, __v)
// ------------------------------------------------------
userSchema.set("toJSON", {
  // it defines a custom transformation function that modifies the output when a document is converted to JSON.
  virtuals: true,
  versionKey: false,
  transform(_, ret: Partial<IUser> & { __v?: number }) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// ------------------------------------------------------
// User Model export
// ------------------------------------------------------
const UserModel = mongoose.model<IUser, UserModelType>("User", userSchema);

export default UserModel;
