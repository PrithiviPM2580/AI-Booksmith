// ============================================================
// 🧩 ExportController — Handles export-related operations
// ============================================================
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import {
  exportAsDocxService,
  exportAsPDFService,
} from "@/services/export.service.js";
import { successResponse } from "@/utils/index.util.js";
import {
  ExportDocxParams,
  ExportPdfParams,
} from "@/validator/export.validator.js";
import type { Request, Response, NextFunction } from "express";

// ------------------------------------------------------
// exportAsPDF() — Handles exporting content as a PDF
// ------------------------------------------------------
export const exportAsPDFController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract user ID from the authenticated request
  const userId = req.user?.userId as string;

  // Extract book ID from request parameters
  const bookId = req.params.bookId as ExportPdfParams["bookId"];

  // Validate presence of book ID
  if (!bookId) {
    // Log error if book ID is missing
    logger.error("Book ID is missing in the request parameters", {
      label: "ExportController",
    });

    // Pass error to next middleware
    return next(
      new APIError(400, "Book ID is required to export as PDF", {
        type: "InvalidInput",
        details: [
          {
            field: "bookId",
            message: "Book ID is required",
          },
        ],
      })
    );
  }

  // Call service to export book as PDF
  await exportAsPDFService(bookId, userId, res);

  // Log successful export
  logger.info("PDF export completed successfully", {
    label: "ExportController",
  });

  // Send success response to client
  successResponse(res, 200, "Book exported as PDF successfully");
};

// ------------------------------------------------------
// exportAsDocxController() — Handles exporting content as a DOCX
// ------------------------------------------------------
export const exportAsDocxController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract user ID from the authenticated request
  const userId = req.user?.userId as string;

  // Extract book ID from request parameters
  const bookId = req.params.id as ExportDocxParams["bookId"];

  // Validate presence of book ID
  if (!bookId) {
    // Log error if book ID is missing
    logger.error("Book ID is missing in the request parameters", {
      label: "ExportController",
    });

    // Pass error to next middleware
    return next(
      new APIError(400, "Book ID is required to export as DOCX", {
        type: "InvalidInput",
        details: [
          {
            field: "bookId",
            message: "Book ID is required",
          },
        ],
      })
    );
  }

  // Call service to export book as DOCX
  await exportAsDocxService(bookId, userId, res);

  // Log successful export
  logger.info("DOCX export completed successfully", {
    label: "ExportController",
  });

  // Send success response to client
  successResponse(res, 200, "Book exported as DOCX successfully");
};
