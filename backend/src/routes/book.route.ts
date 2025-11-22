// ============================================================
// 🧩 BookRoute — Handles book-related API routes
// ============================================================
import {
  createBookController,
  getAllBooksController,
} from "@/controllers/book.controller.js";
import asyncHandlerMiddleware from "@/middlewares/async-handler.middleware.js";
import authenticateMiddleware from "@/middlewares/authenticate.middleware.js";
import {
  limiters,
  rateLimitingMiddleware,
} from "@/middlewares/rate-limiting.middleware.js";
import validateRequestMiddleware from "@/middlewares/validate-request.middleware.js";
import { createBookSchema } from "@/validator/book.validator.js";
import { Router } from "express";

// Create a new router instance
const router: Router = Router();

// ------------------------------------------------------
// CreateBook Route
// ------------------------------------------------------
// @desc    Create a new book
// @route   POST /api/v1/books
// @access  Private
router.route("/").post(
  authenticateMiddleware(["user"]), // Ensure the user is authenticated and has the "user" role
  rateLimitingMiddleware(limiters.user, (req) => req.user?.userId as string), // Apply rate limiting based on user ID
  validateRequestMiddleware(createBookSchema), // Validate the request body against the createBookSchema
  asyncHandlerMiddleware(createBookController) // Handle the request asynchronously and catch errors
);

// ------------------------------------------------------
// GetAllBooks Route
// ------------------------------------------------------
// @desc    Get all books
// @route   GET /api/v1/books
// @access  Private
router.route("/").get(
  authenticateMiddleware(["user"]), // Ensure the user is authenticated and has the "user" role
  rateLimitingMiddleware(limiters.user, (req) => req.user?.userId as string), // Apply rate limiting based on user ID
  asyncHandlerMiddleware(getAllBooksController) // Handle the request asynchronously and catch errors
);

// ------------------------------------------------------
// GetBook Route
// ------------------------------------------------------
// @desc    Get a book
// @route   GET /api/v1/books/:bookId
// @access  Private
router.route("/:bookId").get();

// ------------------------------------------------------
// DeleteBook Route
// ------------------------------------------------------
// @desc    Delete a book
// @route   DELETE /api/v1/books/:bookId
// @access  Private
router.route("/:bookId").delete();

// ------------------------------------------------------
// UpdateBook Route
// ------------------------------------------------------
// @desc    Update a book
// @route   PATCH /api/v1/books/:bookId
// @access  Private
router.route("/:bookId").patch();

// ------------------------------------------------------
// UpdateBookCover Route
// ------------------------------------------------------
// @desc    Update book cover image
// @route   PUT /api/v1/books/cover/:bookId
// @access  Private
router.route("/cover/:bookId").put();

export default router;
