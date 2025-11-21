// ============================================================
// 🧩 AuthRoute — Authentication routes and handlers
// ============================================================
import { Router } from "express";

// Create a new router instance
const router: Router = Router();

// ------------------------------------------------------
// Register User Route
// ------------------------------------------------------
// @desc    Register new User
// @route   POST /api/v1/auth/register
// @access  Public

router.route("/register").post();

// ------------------------------------------------------
// Login User Route
// ------------------------------------------------------
// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
router.route("/login").post();

// ------------------------------------------------------
// Logout User Route
// ------------------------------------------------------
// @desc    Logout User
// @route   POST /api/v1/auth/logout
// @access  Private
router.route("/logout").post();

// ------------------------------------------------------
// Refresh Token Route
// ------------------------------------------------------
// @desc    Refresh Auth Token
// @route   GET /api/v1/auth/refresh-token
// @access  Public
router.route("/refresh-token").get();

// ------------------------------------------------------
// GetProfile Route
// ------------------------------------------------------
// @desc    Get User Profile
// @route   GET /api/v1/auth/profile
// @access  Private
router.route("/profile").get();

// ------------------------------------------------------
// UpdateProfile route
// ------------------------------------------------------
// @desc    Update User Profile
// @route   PUT /api/v1/auth/me
// @access  Private
router.route("/me").put();
// ------------------------------------------------------
