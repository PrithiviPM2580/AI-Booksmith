// ============================================================
// 🧩 AIRoute — AI-related API routes
// ============================================================
import {
  generateChapterContentController,
  generateOutlineController,
} from "@/controllers/ai.controller.js";
import asyncHandlerMiddleware from "@/middlewares/async-handler.middleware.js";
import authenticateMiddleware from "@/middlewares/authenticate.middleware.js";
import {
  limiters,
  rateLimitingMiddleware,
} from "@/middlewares/rate-limiting.middleware.js";
import validateRequestMiddleware from "@/middlewares/validate-request.middleware.js";
import {
  generateChapterContentSchema,
  generateOutlineSchema,
} from "@/validator/ai.validator.js";
import { Router } from "express";

// Initialize router
const router: Router = Router();

// ------------------------------------------------------
// GenerateOutline Route
// ------------------------------------------------------
// @desc    Generate a outline
// @route   POST /api/v1/ai/generate-outline
// @access  Private
router.route("/generate-outline").post(
  authenticateMiddleware(["user"]),
  rateLimitingMiddleware(limiters.user, (req) => req.user?.userId as string),
  validateRequestMiddleware(generateOutlineSchema),
  asyncHandlerMiddleware(generateOutlineController)
);

// ------------------------------------------------------
// GenerateChapterContent Route
// ------------------------------------------------------
// @desc    Generate chapter content
// @route   POST /api/v1/ai/generate-chapter-content
// @access  Private
router.route("/generate-chapter-content").post(
  authenticateMiddleware(["user"]),
  rateLimitingMiddleware(limiters.user, (req) => req.user?.userId as string),
  validateRequestMiddleware(generateChapterContentSchema),
  asyncHandlerMiddleware(generateChapterContentController)
);

export default router;
