// ============================================================
// 🧩 BookRoute — Handles book-related API routes
// ============================================================
import { Router } from "express";

// Create a new router instance
const router: Router = Router();

// ------------------------------------------------------
// CreateBook Route
// ------------------------------------------------------
// @desc    Create a new book
// @route   POST /api/v1/books
// @access  Private
router.route("/").post();

// ------------------------------------------------------
// GetAllBook Route
// ------------------------------------------------------
// @desc    Get all books
// @route   GET /api/v1/books
// @access  Private
router.route("/").get();

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
