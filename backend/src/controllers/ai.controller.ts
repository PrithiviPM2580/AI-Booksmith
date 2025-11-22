// ============================================================
// 🧩 AIController — Handles AI-related operations
// ============================================================
import type { Request, Response, NextFunction } from "express";
import { GenerateOutlineInput } from "@/validator/ai.validator.js";
import { generateOutlineService } from "@/services/ai.service.js";
import logger from "@/lib/logger.lib.js";
import APIError from "@/lib/api-error.lib.js";
import { successResponse } from "@/utils/index.util.js";

// ------------------------------------------------------
// generateOutlineController() — Generates an outline based on input
// ------------------------------------------------------
export const generateOutlineController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Call the service to generate the outline
  const generatedOutline = await generateOutlineService(
    req.body as GenerateOutlineInput
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
      })
    );
  }

  // Log success message
  logger.info("Outline generated successfully", { label: "AIController" });

  // Send success response with the generated outline
  successResponse(res, 200, "Outline generated successfully", {
    outline: generatedOutline,
  });
};
