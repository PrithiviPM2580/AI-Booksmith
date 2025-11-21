// ============================================================
// 🧩 TokenModel — Refresh token data model and schema definition
// ============================================================
import mongoose, {
	type HydratedDocument,
	type Model,
	Schema,
	type Types,
} from "mongoose";

// ------------------------------------------------------
// Define Token Interface
// ------------------------------------------------------
export interface IToken {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	token: string;
	userAgent: string;
	ipAddress: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Document and Mode type
export type TokenDocument = HydratedDocument<IToken>;
export type TokenModelType = Model<IToken>;
export type TokenObject = IToken;

// ------------------------------------------------------
// Define Token Schema
// ------------------------------------------------------
const TokenSchema = new Schema<IToken, TokenModelType>(
	{
		_id: { type: Schema.Types.ObjectId, required: true, auto: true },
		userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
		token: { type: String, required: true, trim: true },
		userAgent: { type: String, required: true, trim: true },
		ipAddress: { type: String, required: true, trim: true },
		expiresAt: { type: Date, required: true },
	},
	{
		timestamps: true,
	},
);

// Transform output (remove password, __v)
// ------------------------------------------------------
TokenSchema.set("toJSON", {
	// it defines a custom transformation function that modifies the output when a document is converted to JSON.
	transform(_, ret: Partial<IToken> & { __v?: number }) {
		delete ret.__v;
		return ret;
	},
});

// ------------------------------------------------------
// Token Model export
// ------------------------------------------------------
const TokenModel = mongoose.model<IToken>("Token", TokenSchema);

export default TokenModel;
