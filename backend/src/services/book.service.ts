// ============================================================
// 🧩 BookService — Handles book-related business logic
// ============================================================

import { Types } from "mongoose";
import { CreateBookInput } from "@/validator/book.validator.js";
import logger from "@/lib/logger.lib.js";
import APIError from "@/lib/api-error.lib.js";
import { createBook } from "@/dao/book.dao.js";

// ------------------------------------------------------
// createBookService() — Creates a new book entry
// ------------------------------------------------------
export const createBookService = async (
  userId: Types.ObjectId,
  bookData: CreateBookInput
) => {
  // Validate userId
  if (!userId) {
    // Log error and throw APIError
    logger.error("User ID is missing in createBookService", {
      label: "BookService",
    });

    //  Throw validation error
    throw new APIError(400, "User ID is required to create a book", {
      type: "VALIDATION_ERROR",
      details: [
        {
          field: "userId",
          message: "User ID cannot be null or undefined",
        },
      ],
    });
  }

  // Destructure book data
  const { title, author, subtitle, chapters } = bookData;

  // Create new book entry
  const newBook = await createBook({
    userId,
    title,
    author,
    subtitle,
    chapters,
  });

  // Return the created book document
  return newBook;
};
