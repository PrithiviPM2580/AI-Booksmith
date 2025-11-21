// ============================================================
// 🧩 AuthRoute — Authentication routes and handlers
// ============================================================
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from "@/controllers/auth.controller.js";
import asyncHandlerMiddleware from "@/middlewares/async-handler.middleware.js";
import {
  limiters,
  rateLimitingMiddleware,
} from "@/middlewares/rate-limiting.middleware.js";
import validateRequestMiddleware from "@/middlewares/validate-request.middleware.js";
import { loginSchema, registerSchema } from "@/validator/auth.validator.js";
import { Router } from "express";

// Create a new router instance
const router: Router = Router();

// ------------------------------------------------------
// Register User Route
// ------------------------------------------------------
// @desc    Register new User
// @route   POST /api/v1/auth/register
// @access  Public

router.route("/register").post(
  validateRequestMiddleware(registerSchema),
  rateLimitingMiddleware(limiters.auth, (req) => req.ip as string),
  asyncHandlerMiddleware(registerController)
);

// ------------------------------------------------------
// Login User Route
// ------------------------------------------------------
// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
router.route("/login").post(
  validateRequestMiddleware(loginSchema),
  rateLimitingMiddleware(limiters.auth, (req) => req.ip as string),
  asyncHandlerMiddleware(loginController)
);

// ------------------------------------------------------
// Logout User Route
// ------------------------------------------------------
// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Private
router.route("/logout").post(
  rateLimitingMiddleware(limiters.auth, (req) => req.user?.userId as string),
  asyncHandlerMiddleware(logoutController)
);

// ------------------------------------------------------
// Refresh Token Route
// ------------------------------------------------------
// @desc    Refresh Auth Token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
router.route("/refresh-token").post(
  rateLimitingMiddleware(limiters.auth, (req) => req.ip as string),
  asyncHandlerMiddleware(refreshTokenController)
);

// ------------------------------------------------------
// GetProfile Route
// ------------------------------------------------------
// @desc    Get User Profile
// @route   GET /api/v1/auth/profile
// @access  Private
// router.route("/profile").get();

// ------------------------------------------------------
// UpdateProfile route
// ------------------------------------------------------
// @desc    Update User Profile
// @route   PUT /api/v1/auth/me
// @access  Private
// router.route("/me").put();

export default router;
