// ============================================================
// 🧩 BookModel — Book data model and schema definition
// ============================================================
import mongoose, {
	type HydratedDocument,
	type Model,
	Schema,
	type Types,
} from "mongoose";

// ------------------------------------------------------
// Define Book Interface
// ------------------------------------------------------
export interface IChapter {
	title: string;
	description: string;
	content: string;
}

export interface IBook {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	title: string;
	subtitle: string;
	author: string;
	coverImageUrl: string;
	chapters: IChapter[];
	status: "draft" | "published";
	createdAt: Date;
	updatedAt: Date;
}

// Document and Mode type
export type BookDocument = HydratedDocument<IBook>;
export type BookModelType = Model<IBook>;
export type BookObject = IBook;

// ------------------------------------------------------
// Define Book Schema
// ------------------------------------------------------
const chapterSchema = new Schema<IChapter>({
	title: { type: String, required: true, trim: true },
	description: { type: String, required: true, trim: true, default: "" },
	content: { type: String, required: true, trim: true, default: "" },
});

const bookSchema = new Schema<IBook, BookModelType>(
	{
		_id: { type: Schema.Types.ObjectId, required: true, auto: true },
		userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
		title: { type: String, required: true, trim: true },
		subtitle: { type: String, trim: true, default: "" },
		author: { type: String, required: true, trim: true },
		coverImageUrl: { type: String, default: null },
		chapters: { type: [chapterSchema], default: [] },
		status: { type: String, enum: ["draft", "published"], default: "draft" },
	},
	{
		timestamps: true,
	},
);

// ------------------------------------------------------
// Transform output (remove password, __v)
// ------------------------------------------------------
bookSchema.set("toJSON", {
	// it defines a custom transformation function that modifies the output when a document is converted to JSON.
	transform(_, ret: Partial<IBook> & { __v?: number }) {
		delete ret.__v;
		return ret;
	},
});

// ------------------------------------------------------
// Booke Model export
// ------------------------------------------------------
const BookModel = mongoose.model<IBook, BookModelType>("Book", bookSchema);

export default BookModel;
