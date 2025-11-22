// ============================================================
// 🧩 BookDao — Data Access Object for book-related database operations
// ============================================================

import BookModel from "@/models/book.model.js";
import { UpdateBookInput } from "@/validator/book.validator.js";
import type { Types } from "mongoose";

// ------------------------------------------------------
// createBook() — Creates a new book entry in the database
// ------------------------------------------------------
export const createBook = async ({
  userId,
  title,
  subtitle,
  author,
  chapters,
}: CreateBook) => {
  // Create and return the new book document
  return await BookModel.create({
    userId,
    title,
    subtitle,
    author,
    chapters,
  });
};

// ------------------------------------------------------
// findAllBooksByUserId() — Retrieves all books for a given user ID
// ------------------------------------------------------
export const findAllBooksByUserId = async (userId: Types.ObjectId) => {
  // Find and return all books associated with the specified user ID
  return await BookModel.find({ userId }).lean().exec();
};

// ------------------------------------------------------
// findBookById() — Retrieves a specific book by its ID
// ------------------------------------------------------
export const findBookById = async (bookId: Types.ObjectId) => {
  // Find and return the book document with the specified ID
  return await BookModel.findById(bookId).lean().exec();
};

// ------------------------------------------------------
// updateBookById() — Updates a specific book by its ID
// ------------------------------------------------------
export const updateBookById = async (
  bookId: Types.ObjectId,
  updateData: UpdateBookInput
) => {
  // Find the book by ID and update it with the provided data
  return await BookModel.findByIdAndUpdate(
    bookId,
    { $set: updateData },
    { new: true }
  )
    .lean()
    .exec();
};
