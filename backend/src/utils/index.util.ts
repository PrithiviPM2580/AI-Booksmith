// ============================================================
// 🧩 IndexUtils — Utility functions for index operations
// ============================================================

import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { z } from "zod";
import logger from "@/lib/logger.lib.js";

// ------------------------------------------------------
// timeStampToDate() — Returns the current timestamp as an ISO string
// ------------------------------------------------------
export const timeStampToDate = () => {
  return new Date().toISOString();
};

// ------------------------------------------------------
// logRequest() — Logs details of an incoming request
// ------------------------------------------------------
export const logRequest = ({
  req,
  res,
  message,
  data,
  error,
  label,
}: LogOptions) => {
  // Calculate response time if response object is provided
  const responseTime = `${Date.now() - (res?.locals.startTime || 0)}ms`;

  // Prepare metadata for logging
  const meta: Record<string, unknown> = {
    timestamp: timeStampToDate(),
    method: req.method,
    url: req.originalUrl,
    baseUrl: req.baseUrl || "",
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"] || "",
    body: req.body || {},
    query: req.query || {},
    params: req.params || {},
    statusCode: res?.statusCode,
    responseTime,
  };

  // Add additional data to metadata if provided
  if (data) meta.data = data;

  // Add error details to metadata if provided
  if (error) meta.error = error;

  // Log as error or info based on presence of an error
  error
    ? logger.error(message || "Request Error", meta, { label })
    : logger.info(message || "Request Info", meta, { label });
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
  // Log the request details
  logRequest({
    req,
    res,
    message,
    data,
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
