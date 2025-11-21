// ============================================================
// 🧩 GlobalErrorHandlerMiddleware — Handles global errors
// ============================================================
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import APIError from "@/lib/api-error.lib.js";
import { logRequest } from "@/utils/index.util.js";

// Extract JWT error classes
const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt;

// ------------------------------------------------------
// globalErrorHandlerMiddleware() — Handles global errors
// ------------------------------------------------------
const globalErrorHandlerMiddleware = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	void next;

	// Initialize customError variable
	let customError: APIError;

	// Handle specific JWT errors
	if (err instanceof JsonWebTokenError) {
		// Log the JWT error details
		logRequest({
			req,
			message: "JWT Error occurred",
			error: err.message,
		});

		// Create a new APIError for JWT errors
		customError = new APIError(
			401,
			"Authentication failed. Invalid token provided.",
			{
				type: "JsonWebTokenError",
				details: [{ field: "token", message: err.message }],
			},
			err.stack,
		);
	} else if (err instanceof TokenExpiredError) {
		// Log the token expiration details
		logRequest({
			req,
			message: " JWT Token Expired",
			error: err.message,
		});

		// Create a new APIError for token expiration
		customError = new APIError(
			401,
			"Authentication failed. Token has expired.",
			{
				type: "TokenExpiredError",
				details: [{ field: "token", message: err.message }],
			},
			err.stack,
		);
	} else if (err instanceof NotBeforeError) {
		// Log the not before error details
		logRequest({
			req,
			message: "JWT Not Before Error",
			error: err.message,
		});

		// Create a new APIError for not before errors
		customError = new APIError(
			401,
			"Authentication failed. Token not active yet.",
			{
				type: "NotBeforeError",
				details: [{ field: "token", message: err.message }],
			},
			err.stack,
		);
	} else if (err instanceof APIError) {
		// Log the API error details
		logRequest({
			req,
			message: "API Error occurred",
			error: err.message,
		});

		// Use the existing APIError
		customError = err;
	} else {
		// Log unknown error details
		const unknownError = err as Error;

		// Log the unknown error details
		logRequest({
			req,
			message: "Unknown Error occurred",
			error: unknownError.message,
		});

		// Create a generic APIError for unknown errors
		customError = new APIError(
			500,
			unknownError.message || "Internal Server Error",
			undefined,
			unknownError.stack,
		);
	}

	// Send the error response
	res.status(customError.statusCode).json({
		success: customError.success,
		statusCode: customError.statusCode,
		message: customError.message,
		error: customError.error,
	});
};

export default globalErrorHandlerMiddleware;
