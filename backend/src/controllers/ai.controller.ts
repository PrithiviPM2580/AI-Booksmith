// ============================================================
// 🧩 AIController — Handles AI-related operations
// ============================================================
import type { NextFunction, Request, Response } from "express";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import {
	generateChapterContentService,
	generateOutlineService,
} from "@/services/ai.service.js";
import { successResponse } from "@/utils/index.util.js";
import type {
	GenerateChapterContentInput,
	GenerateOutlineInput,
} from "@/validator/ai.validator.js";

// ------------------------------------------------------
// generateOutlineController() — Generates an outline based on input
// ------------------------------------------------------
export const generateOutlineController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Call the service to generate the outline
	const generatedOutline = await generateOutlineService(
		req.body as GenerateOutlineInput,
	);

	// Handle failure to generate outline
	if (!generatedOutline) {
		// Log error and pass APIError to next middleware
		logger.error("Outline generation failed", {
			label: "AIController",
		});

		// Pass APIError to next middleware
		return next(
			new APIError(500, "Outline generation failed", {
				type: "GenerationError",
				details: [
					{
						field: "outline",
						message: "Failed to generate outline",
					},
				],
			}),
		);
	}

	// Log success message
	logger.info("Outline generated successfully", { label: "AIController" });

	// Send success response with the generated outline
	successResponse(res, 200, "Outline generated successfully", {
		outline: generatedOutline,
	});
};

// ------------------------------------------------------
// generateChapterContentController() — Generates chapter content
// ------------------------------------------------------
export const generateChapterContentController = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Call the service to generate chapter content
	const response = await generateChapterContentService(
		req.body as GenerateChapterContentInput,
	);

	// Handle failure to generate chapter content
	if (!response) {
		// Log error and pass APIError to next middleware
		logger.error("Chapter content generation failed", {
			label: "AIController",
		});

		// Pass APIError to next middleware
		return next(
			new APIError(500, "Chapter content generation failed", {
				type: "GenerationError",
				details: [
					{
						field: "chapterContent",
						message: "Failed to generate chapter content",
					},
				],
			}),
		);
	}

	// Log success message
	logger.info("Chapter content generated successfully", {
		label: "AIController",
	});

	// Send success response with the generated chapter content
	successResponse(res, 200, "Chapter content generated successfully", {
		chapterContent: response,
	});
};
