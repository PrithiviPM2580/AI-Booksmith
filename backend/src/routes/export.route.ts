// ============================================================
// 🧩 ExportRoute — Handles export-related routes
// ============================================================
import { Router } from "express";
import {
	exportAsDocxController,
	exportAsPDFController,
} from "@/controllers/export.controller.js";
import asyncHandlerMiddleware from "@/middlewares/async-handler.middleware.js";
import authenticateMiddleware from "@/middlewares/authenticate.middleware.js";
import {
	limiters,
	rateLimitingMiddleware,
} from "@/middlewares/rate-limiting.middleware.js";
import validateRequestMiddleware from "@/middlewares/validate-request.middleware.js";
import {
	exportDocxSchema,
	exportPdfSchema,
} from "@/validator/export.validator.js";

// Initialize router
const router: Router = Router();

// ------------------------------------------------------
// ExportPdf Route
// ------------------------------------------------------
// @desc    Export in PDF format
// @route   GET /api/v1/exports/:bookId/pdf
// @access  Private
router.route("/:bookId/pdf").get(
	authenticateMiddleware(["user"]), // Ensure the user is authenticated and has the "user" role
	rateLimitingMiddleware(limiters.user, (req) => req.user?.userId as string), // Apply rate limiting based on user ID
	validateRequestMiddleware(exportPdfSchema), // Validate the request parameters against the exportPdfSchema
	asyncHandlerMiddleware(exportAsPDFController), // Handle the request asynchronously and catch errors
);

// ------------------------------------------------------
// ExportDocx Route
// ------------------------------------------------------
// @desc    Export in DOCX format
// @route   GET /api/v1/exports/:bookId/docx
// @access  Private
router.route("/:bookId/docx").get(
	authenticateMiddleware(["user"]), // Ensure the user is authenticated and has the "user" role
	rateLimitingMiddleware(limiters.user, (req) => req.user?.userId as string), // Apply rate limiting based on user ID
	validateRequestMiddleware(exportDocxSchema), // Validate the request parameters against the exportPdfSchema
	asyncHandlerMiddleware(exportAsDocxController), // Handle the request asynchronously and catch errors
);

export default router;
