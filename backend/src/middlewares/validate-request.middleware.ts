// ============================================================
// 🧩 ValidateRequestMiddleware — Request Validation Middleware
// ============================================================
import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { formatIssues } from "@/utils/index.util.js";

// ------------------------------------------------------
// validatePart() — Validates a specific part of the request
// ------------------------------------------------------
const validatePart = (
  part: "body" | "query" | "params",
  schema: z.ZodTypeAny,
  req: Request,
  next: NextFunction
): boolean => {
  if (!schema) return true;

  const result = schema.safeParse(req[part]);

  if (!result.success) {
    const issues = formatIssues(result.error.issues);
    logger.error(`Validation error in request ${part}`, {
      label: "ValidateRequestMiddleware",
      issues,
    });
    next(
      new APIError(400, "Validation Error", {
        type: "ValidationError",
        details: issues,
      })
    );
    return false;
  }

  (req[part] as unknown) = result.data;
  return true;
};

// ------------------------------------------------------
// validateRequestMiddleware() — Middleware to validate request parts
// ------------------------------------------------------
const validateRequestMiddleware =
  (schema: RequestValidate) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const bodyValid = validatePart("body", schema.body, req, next);
      if (!bodyValid) return;
      const queryValid = validatePart("query", schema.query, req, next);
      if (!queryValid) return;
      const paramsValid = validatePart("params", schema.params, req, next);
      if (!paramsValid) return;
      next();
    } catch (error) {
      logger.error("Unexpected error in validation middleware", {
        label: "ValidateRequestMiddleware",
        error,
      });
      next(error);
    }
  };

export default validateRequestMiddleware;
