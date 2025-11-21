// ============================================================
// 🧩 IndexUtils — Utility functions for index operations
// ============================================================

import logger from "@/lib/logger.lib.js";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { z } from "zod";

// ------------------------------------------------------
// timeStampToDate() — Returns the current timestamp as an ISO string
// ------------------------------------------------------
export const timeStampToDate = () => {
  return new Date().toISOString();
};

// ------------------------------------------------------
// formatIssues() — Formats validation issues into a readable string
// ------------------------------------------------------
export const formatIssues = (issues: z.ZodError["issues"]) => {
  // Map each issue to an object with field and message
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

// ------------------------------------------------------
// Key getter return the userId or ip for rate-limiting
// ------------------------------------------------------
export const keyGetter = (req: Request): string => {
  // Return user ID if available, otherwise return IP address
  if (req.user?.userId) {
    return `user-${req.user.userId.toString()}`;
  } else {
    return `ip-${req.ip}`;
  }
};

// ------------------------------------------------------
// successresponse() — Sends a standardized success response
// ------------------------------------------------------
export const successResponse = <T>(
  req: Request,
  res: Response,
  statusCode: number = 200,
  message: string = "Success",
  data?: T
) => {
  logger.info(`Success Response: ${message}`, {
    label: "SuccessResponse",
    data: data,
  });

  // Send the standardized JSON response
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

// ------------------------------------------------------
// generateMongooseId() — Generates a new Mongoose ObjectId as a string
// ------------------------------------------------------
export const generateMongooseId = (): Types.ObjectId => {
  // Generate and return a new Mongoose ObjectId
  return new Types.ObjectId();
};

// ------------------------------------------------------
// getRefreshTokenExpiryDate() — Description:Returns the expiry date for refresh tokens
// ------------------------------------------------------
export const getRefreshTokenExpiryDate = (): Date => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
};
