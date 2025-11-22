// ============================================================
// 🧩 BookController — Handles book-related operations
// ============================================================
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { CreateBookInput } from "@/validator/book.validator.js";
import type { Request, Response, NextFunction } from "express";
import {
  createBookService,
  getAllBooksService,
} from "@/services/book.service.js";
import { successResponse } from "@/utils/index.util.js";

// ------------------------------------------------------
// createBookController() — Creates a new book entry
// ------------------------------------------------------
export const createBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract userId from request
  const userId = req.user?.userId as string;

  // Validate userId
  if (!userId) {
    // Log error and return unauthorized response
    logger.error("User ID is missing in request", {
      label: "BookController",
    });

    //  Return unauthorized error
    return next(
      new APIError(401, "Unauthorized access - User not authenticated", {
        type: "AUTHENTICATION_ERROR",
        details: [
          {
            field: "userId",
            message: "User ID is required to create a book",
          },
        ],
      })
    );
  }

  // Create new book using the service
  const book = await createBookService(userId, req.body as CreateBookInput);

  // Check if book creation was successful
  if (!book) {
    // Log error
    logger.error("Book creation failed", {
      label: "BookController",
    });

    // Return error response
    return next(
      new APIError(500, "Failed to create book", {
        type: "BOOK_CREATION_ERROR",
        details: [
          {
            field: "book",
            message: "Book could not be created due to an internal error",
          },
        ],
      })
    );
  }

  // Log success message
  logger.info(`Book created successfully with ID: ${book._id}`, {
    label: "BookController",
  });

  // Send success response with created book data
  successResponse(res, 201, "Book created successfully", book);
};

// ------------------------------------------------------
// getAllBooksController() — Retrieves all books for a user
// ------------------------------------------------------
export const getAllBooksController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract userId from request
  const userId = req.user?.userId as string;

  // Validate userId
  if (!userId) {
    // Log error and return unauthorized response
    logger.error("User ID is missing in request", {
      label: "BookController",
    });

    //  Return unauthorized error
    return next(
      new APIError(401, "Unauthorized access - User not authenticated", {
        type: "AUTHENTICATION_ERROR",
        details: [
          {
            field: "userId",
            message: "User ID is required to fetch books",
          },
        ],
      })
    );
  }

  // Retrieve all books using the service
  const books = await getAllBooksService(userId);

  if (!books) {
    // Log error
    logger.error("Failed to retrieve books", {
      label: "BookController",
    });

    // Return error response
    return next(
      new APIError(500, "Failed to retrieve books", {
        type: "BOOK_RETRIEVAL_ERROR",
        details: [
          {
            field: "books",
            message: "Books could not be retrieved due to an internal error",
          },
        ],
      })
    );
  }

  // Log success message
  logger.info(`Retrieved ${books.length} books for user ID: ${userId}`, {
    label: "BookController",
  });

  // Send success response with retrieved books data
  successResponse(res, 200, "Books retrieved successfully", books);
};
