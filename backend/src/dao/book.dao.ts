// ============================================================
// 🧩 BookDao — Data Access Object for book-related database operations
// ============================================================

import BookModel from "@/models/book.model.js";

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
