// ============================================================
// 🧩 Routes — Main application routes
// ============================================================
import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import mongoose from "mongoose";
import config from "@/config/env.config.js";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { successResponse } from "@/utils/index.util.js";

// Create a new router instance
const router: Router = Router();

import aiRoutes from "@/routes/ai.route.js";
// ------------------------------------------------------
// Import Route Modules
// ------------------------------------------------------
import authRoutes from "@/routes/auth.route.js";
import bookRoutes from "@/routes/book.route.js";

// ------------------------------------------------------
// Root Route
// ------------------------------------------------------
// @desc    Get API status
// @route   GET /
// @access  Public

router.route("/").get((_req: Request, res: Response, next: NextFunction) => {
	try {
		// Send a success response with application status
		successResponse(res, 200, "AI-Booksmith API is running successfully", {
			appName: "AI-Booksmith", // Updated application name
			status: process.uptime() > 0 ? "Running" : "Stopped", // Application status
			timestamp: new Date().toISOString(), // Current timestamp
			version: config.APP_VERSION, // Application version from config
			env: config.NODE_ENV, // Current environment
		});
	} catch (error) {
		// Log the error details
		logger.error("Error in root route", {
			label: "RootRoute",
			error,
		});
		// Pass the error to the next middleware
		next(error);
	}
});

// ------------------------------------------------------
// Health Route
// ------------------------------------------------------
// @desc    Health Check
// @route   GET /health
// @access  Public
router
	.route("/health")
	.get((_req: Request, res: Response, next: NextFunction) => {
		try {
			// Determine database connection status
			const dbState =
				mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

			// Send a success response with health status
			successResponse(res, 200, "Health Check Successful", {
				status: "ok", // Health status
				service: "AI-Booksmith", // Updated service name
				environment: config.NODE_ENV, // Current environment
				database: dbState, // Database connection status
				uptime: process.uptime(), // Application uptime in seconds
				memoryUsage: `${process.memoryUsage().heapUsed / 1024 / 1024} MB`, // Memory usage in MB
				timestamp: new Date().toISOString(), // Current timestamp
			});
		} catch (error) {
			// Log the error details
			logger.error("Error in health route", {
				label: "HealthRoute",
				error,
			});
			// Pass the error to the next middleware
			next(error);
		}
	});

// ------------------------------------------------------
// Index Route
// ------------------------------------------------------
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/books", bookRoutes);
router.use("/api/v1/ai", aiRoutes);

// ------------------------------------------------------
// Not Found Route
// ------------------------------------------------------
// @desc    Handle Not Found Routes
// @route   ALL *
// @access  Public
router.use((req: Request, _res: Response, next: NextFunction) => {
	logger.warn(`Route not found: ${req.originalUrl}`, {
		label: "NotFoundRoute",
	});
	next(
		new APIError(404, "Not Found", {
			type: "NOT_FOUND",
			details: [
				{
					field: "route",
					message: `The route ${req.originalUrl} does not exist`,
				},
			],
		}),
	);
});

export default router;
