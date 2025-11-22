// ============================================================
// 🧩 BookService — Handles book-related business logic
// ============================================================
import {
  CreateBookInput,
  UpdateBookInput,
} from "@/validator/book.validator.js";
import logger from "@/lib/logger.lib.js";
import APIError from "@/lib/api-error.lib.js";
import {
  createBook,
  findAllBooksByUserId,
  findBookById,
  updateBookById,
} from "@/dao/book.dao.js";
import { Types } from "mongoose";

// ------------------------------------------------------
// createBookService() — Creates a new book entry
// ------------------------------------------------------
export const createBookService = async (
  userId: string,
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

  // Convert userId to ObjectId
  const objectId = new Types.ObjectId(userId);

  // Create new book entry
  const newBook = await createBook({
    userId: objectId,
    title,
    author,
    subtitle,
    chapters,
  });

  // Return the created book document
  return newBook;
};

// ------------------------------------------------------
// getAllBooksService() —
// ------------------------------------------------------
export const getAllBooksService = async (userId: string) => {
  // Validate userId
  if (!userId) {
    // Log error and throw APIError
    logger.error("User ID is missing in getAllBooksService", {
      label: "BookService",
    });

    //  Throw validation error
    throw new APIError(400, "User ID is required to get books", {
      type: "VALIDATION_ERROR",
      details: [
        {
          field: "userId",
          message: "User ID cannot be null or undefined",
        },
      ],
    });
  }

  // Convert userId to ObjectId
  const objectId = new Types.ObjectId(userId);

  // Retrieve all books for the user
  const books = await findAllBooksByUserId(objectId);

  // Return the list of books
  return books;
};

// ------------------------------------------------------
// getBookService() — Retrieves a specific book by ID
// ------------------------------------------------------
export const getBookService = async (bookId: string, userId: string) => {
  if (!bookId) {
    // Log error and throw APIError
    logger.error("Book ID is missing in getBookService", {
      label: "BookService",
    });

    //  Throw validation error
    throw new APIError(400, "Book ID is required to get the book", {
      type: "VALIDATION_ERROR",
      details: [
        {
          field: "bookId",
          message: "Book ID cannot be null or undefined",
        },
      ],
    });
  }

  // Convert bookId to ObjectId
  const objectId = new Types.ObjectId(bookId);

  // Retrieve the book by ID
  const book = await findBookById(objectId);

  if (!book) {
    // Log error and throw APIError
    logger.error(`Book not found for ID: ${bookId} in getBookService`, {
      label: "BookService",
    });

    //  Throw not found error
    throw new APIError(404, "Book not found", {
      type: "NOT_FOUND_ERROR",
      details: [
        {
          field: "bookId",
          message: `No book found with ID: ${bookId}`,
        },
      ],
    });
  }

  if (book.userId.toString() !== userId) {
    logger.error(`Unauthorized access attempt for book ID: ${bookId}`, {
      label: "BookService",
    });

    throw new APIError(403, "Unauthorized to access this book", {
      type: "AUTHORIZATION_ERROR",
      details: [
        {
          field: "userId",
          message: `User ID: ${userId} is not authorized to access book with ID: ${bookId}`,
        },
      ],
    });
  }

  // Return the found book
  return book;
};

// ------------------------------------------------------
// updateBookService() — Updates a specific book by ID
// ------------------------------------------------------
export const updateBookService = async (
  userId: string,
  bookId: string,
  updateData: UpdateBookInput
) => {
  // Validate userId and bookId
  if (!userId) {
    // Log error and throw APIError
    logger.error("User ID is missing in updateBookService", {
      label: "BookService",
    });

    //  Throw validation error
    throw new APIError(400, "User ID is required to update the book", {
      type: "VALIDATION_ERROR",
      details: [
        {
          field: "userId",
          message: "User ID cannot be null or undefined",
        },
      ],
    });
  }

  // Validate bookId
  if (!bookId) {
    // Log error and throw APIError
    logger.error("Book ID is missing in updateBookService", {
      label: "BookService",
    });

    //  Throw validation error
    throw new APIError(400, "Book ID is required to update the book", {
      type: "VALIDATION_ERROR",
      details: [
        {
          field: "bookId",
          message: "Book ID cannot be null or undefined",
        },
      ],
    });
  }

  // Convert bookId to ObjectId
  const objectId = new Types.ObjectId(bookId);

  // Retrieve the book by ID to ensure it exists
  const book = await findBookById(objectId);

  // Check if book exists
  if (!book) {
    // Log error and throw APIError
    logger.error(`Book not found for ID: ${bookId} in updateBookService`, {
      label: "BookService",
    });

    //  Throw not found error
    throw new APIError(404, "Book not found", {
      type: "NOT_FOUND_ERROR",
      details: [
        {
          field: "bookId",
          message: `No book found with ID: ${bookId}`,
        },
      ],
    });
  }

  // Check if the user is authorized to update the book
  if (book.userId.toString() !== userId) {
    // Log error and throw APIError
    logger.error(`Unauthorized update attempt for book ID: ${bookId}`, {
      label: "BookService",
    });

    //  Throw authorization error
    throw new APIError(403, "Unauthorized to update this book", {
      type: "AUTHORIZATION_ERROR",
      details: [
        {
          field: "userId",
          message: `User ID: ${userId} is not authorized to update book with ID: ${bookId}`,
        },
      ],
    });
  }

  // Update the book with the provided data
  const updatedBook = await updateBookById(objectId, updateData);

  // Check if the update was successful
  if (!updatedBook) {
    // Log error and throw APIError
    logger.error(
      `Failed to update book for ID: ${bookId} in updateBookService`,
      {
        label: "BookService",
      }
    );

    //  Throw internal server error
    throw new APIError(500, "Failed to update the book", {
      type: "INTERNAL_SERVER_ERROR",
      details: [
        {
          field: "bookId",
          message: `Could not update book with ID: ${bookId}`,
        },
      ],
    });
  }

  // Return the updated book document
  return updatedBook;
};
