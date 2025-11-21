// ============================================================
// 🧩 AuthController — Handles authentication-related requests
// ============================================================

import type { NextFunction, Request, Response } from "express";
import APIError from "@/lib/api-error.lib.js";
import cookieLib from "@/lib/cookie.lib.js";
import jwtLib from "@/lib/jwt.lib.js";
import logger from "@/lib/logger.lib.js";
import {
	getProfileService,
	loginService,
	logoutService,
	refreshTokenService,
	registerService,
	updateProfileService,
} from "@/services/auth.service.js";
import { successResponse } from "@/utils/index.util.js";
import type {
	LoginInput,
	RegisterInput,
	UpdateProfileInput,
} from "@/validator/auth.validator.js";

// ------------------------------------------------------
// registerController() — Handles user sign-up requests
// ------------------------------------------------------
export const registerController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Call the register service with user data and request
	const { user, accessToken, refreshToken } = await registerService(
		req.body as RegisterInput,
		req,
	);

	// Handle potential failures
	if (!user) {
		// Log the failure for debugging and monitoring
		logger.error("User registration failed", {
			label: "RegisterController",
		});

		// Pass an error to the next middleware
		return next(
			new APIError(500, "User sign-up failed", {
				type: "InternalServerError",
				details: [
					{
						field: "Signup",
						message: "User sign-up process failed",
					},
				],
			}),
		);
	}

	// Ensure tokens are generated
	if (!accessToken || !refreshToken) {
		// Log the failure for debugging and monitoring
		logger.error("Token generation failed during registration", {
			label: "RegisterController",
		});

		// Pass an error to the next middleware
		return next(
			new APIError(500, "Token generation failed", {
				type: "InternalServerError",
				details: [
					{
						field: "Token",
						message: "Failed to generate access or refresh token",
					},
				],
			}),
		);
	}

	// Set the refresh token as an HTTP-only cookie
	cookieLib.setCookie(res, "refreshToken", refreshToken);

	// Log the successful sign-up request
	successResponse(res, 201, "User signed up successfully", {
		user,
		accessToken,
	});
};

// ------------------------------------------------------
// loginController() — Handles user login requests
// ------------------------------------------------------
export const loginController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Call the login service with user data and request
	const { user, accessToken, refreshToken } = await loginService(
		req.body as LoginInput,
		req,
	);

	// Handle potential failures
	if (!user) {
		// Log the failure for debugging and monitoring
		logger.error("User retrieval failed after authentication", {
			label: "LoginController",
		});

		// Pass an error to the next middleware
		return next(
			new APIError(500, "Login failed", {
				type: "InternalServerError",
				details: [
					{
						field: "Login",
						message: "User retrieval failed after authentication",
					},
				],
			}),
		);
	}

	// Ensure tokens are generated
	if (!accessToken || !refreshToken) {
		// Log the failure for debugging and monitoring
		logger.error("Token generation failed during login", {
			label: "LoginController",
		});

		// Pass an error to the next middleware
		return next(
			new APIError(500, "Token generation failed", {
				type: "InternalServerError",
				details: [
					{
						field: "Token",
						message: "Access or refresh token generation failed",
					},
				],
			}),
		);
	}

	// Set the refresh token as an HTTP-only cookie
	cookieLib.setCookie(res, "refreshToken", refreshToken);

	// Log the successful login request
	successResponse(res, 200, "Login successful", {
		user,
		accessToken,
	});
};

// ------------------------------------------------------
// logoutController() — Handles user logout requests
// ------------------------------------------------------
export const logoutController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Extract the refresh token from cookies
	const refreshToken = cookieLib.getCookie(req, "refreshToken");

	// Handle missing refresh token
	if (!refreshToken) {
		// Log the missing token scenario
		logger.warn("Refresh token missing during logout", {
			label: "LogoutController",
		});

		// Pass an error to the next middleware
		return next(
			new APIError(400, "Refresh token missing", {
				type: "RefreshTokenMissing",
				details: [
					{
						field: "refreshToken",
						message: "Refresh token is required for logout",
					},
				],
			}),
		);
	}

	// Verify the refresh token and extract payload
	const payload = jwtLib.verifyRefreshToken(refreshToken);

	// Handle invalid token payload
	const isLogout = await logoutService(refreshToken);

	// Handle logout failure
	if (!isLogout) {
		// Log the failure for debugging and monitoring
		logger.error("Logout service failed to invalidate token", {
			label: "LogoutController",
		});

		// Pass an error to the next middleware
		return next(
			new APIError(500, "Failed to logout user", {
				type: "LogoutError",
				details: [
					{
						field: "refreshToken",
						message: "Failed to delete refresh token during logout",
					},
				],
			}),
		);
	}

	// Clear the refresh token cookie
	cookieLib.clearCookie(res, "refreshToken");

	// Log the successful logout
	logger.info(`User ${payload.userId} logged out successfully`, {
		label: "LogoutController",
	});

	// Send success response
	successResponse(res, 200, "Logged out successfully");
};

// ------------------------------------------------------
// refreshTokenController() — Handles token refresh requests
// ------------------------------------------------------
export const refreshTokenController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Extract refresh token from cookies
	const refreshToken = cookieLib.getCookie(req, "refreshToken");

	// Validate presence of refresh token
	if (!refreshToken) {
		logger.warn("No refresh token found in cookies", {
			label: "REFRESH_TOKEN_CONTROLLER",
		});
		next(
			new APIError(401, "Authentication required. Please log in again.", {
				type: "Unauthorized",
				details: [
					{
						field: "refreshToken",
						message: "No refresh token provided",
					},
				],
			}),
		);
	}

	// Call refresh token service
	const { newAccessToken, newRefreshToken } = await refreshTokenService(
		refreshToken as string,
		req,
	);

	// Set new refresh token in cookies
	cookieLib.setCookie(res, "refreshToken", newRefreshToken);

	// Log the token refresh event
	logger.info("Refresh token rotated and new access token issued", {
		label: "REFRESH_TOKEN_CONTROLLER",
	});

	// Send success response with new access token
	successResponse(res, 200, "Token refreshed successfully", {
		accessToken: newAccessToken,
	});
};

// ------------------------------------------------------
// getProfileController() — Handles fetching user profile requests
// ------------------------------------------------------
export const getProfileController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Extract user ID from request (set by authentication middleware)
	const userId = req.user?.userId;

	// Validate presence of user ID
	if (!userId) {
		// Log the missing user ID scenario
		logger.error("User ID missing in request", {
			label: "GetProfileController",
		});

		// Return error for missing user ID
		return next(
			new APIError(400, "User ID is required to fetch profile", {
				type: "UserIDMissing",
				details: [
					{
						field: "userId",
						message: "User ID not found in request",
					},
				],
			}),
		);
	}

	// Fetch user profile using the service
	const user = await getProfileService(userId as string);

	// Log the successful profile fetch
	logger.info(`Fetched profile for user ID: ${userId}`, {
		label: "GetProfileController",
	});
	// Handle case where user is not found
	successResponse(res, 200, "User profile fetched successfully", {
		user,
	});
};

// ------------------------------------------------------
// updateProfileController() — Handles updating user profile requests
// ------------------------------------------------------
export const updateProfileController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const userId = req.user?.userId;

	if (!userId) {
		logger.error("User ID missing in request", {
			label: "UpdateProfileController",
		});

		return next(
			new APIError(400, "User ID is required to update profile", {
				type: "UserIDMissing",
				details: [
					{
						field: "userId",
						message: "User ID not found in request",
					},
				],
			}),
		);
	}

	const { updateUser } = await updateProfileService(
		userId,
		req.body as UpdateProfileInput,
	);

	if (!updateUser) {
		logger.error(`Failed to update profile for user ID: ${userId}`, {
			label: "UpdateProfileController",
		});

		return next(
			new APIError(500, "Failed to update user profile", {
				type: "ProfileUpdateError",
				details: [
					{
						field: "Update",
						message: "User profile update operation failed",
					},
				],
			}),
		);
	}

	logger.info(`Updated profile for user ID: ${userId}`, {
		label: "UpdateProfileController",
	});

	successResponse(res, 200, "User profile updated successfully", {
		user: updateUser,
	});
};
