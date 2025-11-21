// ============================================================
// 🧩 RefreshTokenModel — Refresh token data model and schema definition
// ============================================================
import mongoose, { Schema, HydratedDocument, Model, Types } from "mongoose";

// ------------------------------------------------------
// Define RefreshToken Interface
// ------------------------------------------------------
export interface IRefreshToken {
  __id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Document and Mode type
export type RefreshTokenDocument = HydratedDocument<IRefreshToken>;
export type RefreshTokenModelType = Model<IRefreshToken>;
export type RefreshTokenObject = IRefreshToken;

// ------------------------------------------------------
// Define RefreshToken Schema
// ------------------------------------------------------
const refreshTokenSchema = new Schema<IRefreshToken, RefreshTokenModelType>(
  {
    __id: { type: Schema.Types.ObjectId, required: true, auto: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    token: { type: String, required: true, trim: true },
    userAgent: { type: String, required: true, trim: true },
    ipAddress: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Transform output (remove password, __v)
// ------------------------------------------------------
refreshTokenSchema.set("toJSON", {
  // it defines a custom transformation function that modifies the output when a document is converted to JSON.
  transform(_, ret: Partial<IRefreshToken> & { __v?: number }) {
    delete ret.__v;
    return ret;
  },
});

// ------------------------------------------------------
// RefreshToken Model export
// ------------------------------------------------------
const RefreshTokenModel = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshTokenModel;
