// ============================================================
// 🧩 BookValidator — Validates book-related data
// ============================================================
import { z } from "zod";

// ------------------------------------------------------
// createBookSchema{} —
// ------------------------------------------------------
export const createBookSchema = {
	body: z.object({
		title: z.string("Title must be a string").min(1, "Title is required"),
		subtitle: z.string("Subtitle must be a string").optional(),
		author: z.string("Author must be a string").min(1, "Author is required"),
		chapters: z
			.array(
				z.object({
					title: z
						.string("Chapter title must be a string")
						.min(1, "Chapter title is required"),
					description: z
						.string("Chapter description must be a string")
						.optional(),
					content: z.string("Chapter content must be a string").optional(),
				}),
			)
			.optional(),
	}),
};

// ------------------------------------------------------
// getBookSchema{} — Validates parameters for getting a book
// ------------------------------------------------------
export const getBookSchema = {
	params: z.object({
		bookId: z.string("Book ID must be a string").min(1, "Book ID is required"),
	}),
};

// ------------------------------------------------------
// updateBookSchema{} — Validation schema for updating a book
// ------------------------------------------------------
export const updateBookSchema = {
	body: z.object({
		title: z
			.string("Title must be a string")
			.min(1, "Title is required")
			.optional(),
		subtitle: z.string("Subtitle must be a string").optional(),
		author: z
			.string("Author must be a string")
			.min(1, "Author is required")
			.optional(),
		coverImageUrl: z.string("Cover Image URL must be a string").optional(),
		status: z.enum(["draft", "published"]).default("draft").optional(),
		chapters: z
			.array(
				z.object({
					title: z
						.string("Chapter title must be a string")
						.min(1, "Chapter title is required"),
					description: z
						.string("Chapter description must be a string")
						.optional(),
					content: z.string("Chapter content must be a string").optional(),
				}),
			)
			.optional(),
	}),
	params: z.object({
		bookId: z.string("Book ID must be a string").min(1, "Book ID is required"),
	}),
};

// ------------------------------------------------------
// deleteBookSchema{} — Validation schema for deleting a book
// ------------------------------------------------------
export const deleteBookSchema = {
	params: z.object({
		bookId: z.string("Book ID must be a string").min(1, "Book ID is required"),
	}),
};

// ------------------------------------------------------
// updateBookCoverSchema{} — Validation schema for updating a book cover image
// ------------------------------------------------------
export const updateBookCoverSchema = {
	params: z.object({
		bookId: z.string("Book ID must be a string").min(1, "Book ID is required"),
	}),
};

// ------------------------------------------------------
// Define the type defination of the schemas
// ------------------------------------------------------
export type CreateBookInput = z.infer<typeof createBookSchema.body>;
export type GetBookParams = z.infer<typeof getBookSchema.params>;
export type UpdateBookInput = z.infer<typeof updateBookSchema.body>;
export type UpdateBookParams = z.infer<typeof updateBookSchema.params>;
export type DeleteBookParams = z.infer<typeof deleteBookSchema.params>;
export type UpdateBookCoverParams = z.infer<
	typeof updateBookCoverSchema.params
>;
