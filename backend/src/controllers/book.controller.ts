// ============================================================
// 🧩 BookController — Handles book-related operations
// ============================================================
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import {
  CreateBookInput,
  DeleteBookParams,
  GetBookParams,
  UpdateBookInput,
  UpdateBookParams,
} from "@/validator/book.validator.js";
import type { Request, Response, NextFunction } from "express";
import {
  createBookService,
  getAllBooksService,
  getBookService,
  updateBookService,
  deleteBookService,
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

// ------------------------------------------------------
// getBookController() — Retrieves a specific book by ID
// ------------------------------------------------------
export const getBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract bookId from request parameters
  const bookId = req.params.bookId as GetBookParams["bookId"];

  // Extract userId from request
  const userId = req.user?.userId as string;

  // Validate bookId
  if (!bookId) {
    // Log error and return bad request response
    logger.error("Book ID is missing in request", {
      label: "BookController",
    });

    //  Return bad request error
    return next(
      new APIError(400, "Book ID is required to fetch the book", {
        type: "VALIDATION_ERROR",
        details: [
          {
            field: "bookId",
            message: "Book ID cannot be null or undefined",
          },
        ],
      })
    );
  }

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
            message: "User ID is required to get a book",
          },
        ],
      })
    );
  }

  // Retrieve the book using the service
  const book = await getBookService(bookId, userId);

  // Check if book was found
  logger.info(`Book retrieved successfully with ID: ${bookId}`, {
    label: "BookController",
  });

  // Send success response with retrieved book data
  successResponse(res, 200, "Book retrieved successfully", book);
};

// ------------------------------------------------------
// updateBookController() —
// ------------------------------------------------------
export const updateBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract bookId from request parameters
  const bookId = req.params.bookId as UpdateBookParams["bookId"];

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
            message: "User ID is required to update a book",
          },
        ],
      })
    );
  }

  // Validate bookId
  if (!bookId) {
    // Log error and return bad request response
    logger.error("Book ID is missing in request", {
      label: "BookController",
    });

    //  Return bad request error
    return next(
      new APIError(400, "Book ID is required to update the book", {
        type: "VALIDATION_ERROR",
        details: [
          {
            field: "bookId",
            message: "Book ID cannot be null or undefined",
          },
        ],
      })
    );
  }

  // Update the book using the service
  const updateBook = await updateBookService(
    userId,
    bookId,
    req.body as UpdateBookInput
  );

  // Log success message
  logger.info(`Book updated successfully with ID: ${bookId}`, {
    label: "BookController",
  });

  // Send success response with updated book data
  successResponse(res, 200, "Book updated successfully", updateBook);
};

// ------------------------------------------------------
// deleteBookController() — Handles the deletion of a book
// ------------------------------------------------------
export const deleteBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const bookId = req.params.bookId as DeleteBookParams["bookId"];

  const userId = req.user?.userId as string;

  // Validate userId
  if (!userId) {
    logger.error("User ID is missing in request", {
      label: "BookController",
    });

    return next(
      new APIError(401, "Unauthorized access - User not authenticated", {
        type: "AUTHENTICATION_ERROR",
        details: [
          {
            field: "userId",
            message: "User ID is required to delete a book",
          },
        ],
      })
    );
  }

  // Validate bookId
  if (!bookId) {
    logger.error("Book ID is missing in request", {
      label: "BookController",
    });

    return next(
      new APIError(400, "Book ID is required to delete the book", {
        type: "VALIDATION_ERROR",
        details: [
          {
            field: "bookId",
            message: "Book ID cannot be null or undefined",
          },
        ],
      })
    );
  }

  await deleteBookService(userId, bookId);

  logger.info(`Book deleted successfully with ID: ${bookId}`, {
    label: "BookController",
  });

  successResponse(res, 200, "Book deleted successfully");
};
