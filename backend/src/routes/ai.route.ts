// ============================================================
// 🧩 AIRoute — AI-related API routes
// ============================================================
import { Router } from "express";

// Initialize router
const router: Router = Router();

// ------------------------------------------------------
// GenerateOutline Route
// ------------------------------------------------------
// @desc    Generate a outline
// @route   POST /api/v1/ai/generate-outline
// @access  Private
router.route("/generate-outline").post();

// ------------------------------------------------------
// GenerateChapterContent Route
// ------------------------------------------------------
// @desc    Generate chapter content
// @route   POST /api/v1/ai/generate-chapter-content
// @access  Private
router.route("/generate-chapter-content").post();

export default router;
