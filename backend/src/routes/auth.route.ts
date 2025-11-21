// ============================================================
// 🧩 AuthRoute — Authentication routes and handlers
// ============================================================

import { Router } from "express";
import {
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateProfileController,
} from "@/controllers/auth.controller.js";
import asyncHandlerMiddleware from "@/middlewares/async-handler.middleware.js";
import authenticateMiddleware from "@/middlewares/authenticate.middleware.js";
import {
  limiters,
  rateLimitingMiddleware,
} from "@/middlewares/rate-limiting.middleware.js";
import validateRequestMiddleware from "@/middlewares/validate-request.middleware.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "@/validator/auth.validator.js";

// Create a new router instance
const router: Router = Router();

// ------------------------------------------------------
// Register User Route
// ------------------------------------------------------
// @desc    Register new User
// @route   POST /api/v1/auth/register
// @access  Public

router.route("/register").post(
  validateRequestMiddleware(registerSchema), // Validate request body
  rateLimitingMiddleware(limiters.auth, (req) => req.ip as string), // Apply rate limiting
  asyncHandlerMiddleware(registerController) // Handle the request asynchronously
);

// ------------------------------------------------------
// Login User Route
// ------------------------------------------------------
// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
router.route("/login").post(
  validateRequestMiddleware(loginSchema), // Validate request body
  rateLimitingMiddleware(limiters.auth, (req) => req.ip as string), // Apply rate limiting
  asyncHandlerMiddleware(loginController) // Handle the request asynchronously
);

// ------------------------------------------------------
// Logout User Route
// ------------------------------------------------------
// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Private
router.route("/logout").post(
  authenticateMiddleware(["user"]), // Authenticate user
  rateLimitingMiddleware(limiters.auth, (req) => req.user?.userId as string), // Apply rate limiting
  asyncHandlerMiddleware(logoutController) // Handle the request asynchronously
);

// ------------------------------------------------------
// Refresh Token Route
// ------------------------------------------------------
// @desc    Refresh Auth Token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
router.route("/refresh-token").post(
  rateLimitingMiddleware(limiters.auth, (req) => req.ip as string), // Apply rate limiting
  asyncHandlerMiddleware(refreshTokenController) // Handle the request asynchronously
);

// ------------------------------------------------------
// GetProfile Route
// ------------------------------------------------------
// @desc    Get User Profile
// @route   GET /api/v1/auth/profile
// @access  Private
router.route("/profile").get(
  authenticateMiddleware(["user"]), // Authenticate user
  rateLimitingMiddleware(limiters.api, (req) => req.user?.userId as string), // Apply rate limiting
  asyncHandlerMiddleware(getProfileController) // Handle the request asynchronously
);

// ------------------------------------------------------
// UpdateProfile route
// ------------------------------------------------------
// @desc    Update User Profile
// @route   PATCH /api/v1/auth/profile
// @access  Private
router.route("/profile").patch(
  authenticateMiddleware(["user"]), // Authenticate user
  rateLimitingMiddleware(limiters.api, (req) => req.user?.userId as string), // Apply rate limiting
  validateRequestMiddleware(updateProfileSchema), // Validate request body
  asyncHandlerMiddleware(updateProfileController) // Handle the request asynchronously
);

export default router;
