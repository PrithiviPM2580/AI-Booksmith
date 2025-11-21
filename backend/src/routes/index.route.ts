// ============================================================
// 🧩 Routes — Main application routes
// ============================================================
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import mongoose from "mongoose";
import config from "@/config/env.config.js";
import APIError from "@/lib/api-error.lib.js";
import { logRequest, successResponse } from "@/utils/index.util.js";

const router: Router = Router();

// ------------------------------------------------------
// Root Route
// ------------------------------------------------------
router.route("/").get((req: Request, res: Response, next: NextFunction) => {
  try {
    // Send a success response with application status
    successResponse(req, res, 200, "LekhanX API is running successfully", {
      appName: "LekhanX - AI Blogging Platform", // Updated application name
      status: process.uptime() > 0 ? "Running" : "Stopped", // Application status
      timestamp: new Date().toISOString(), // Current timestamp
      version: config.APP_VERSION, // Application version from config
      env: config.NODE_ENV, // Current environment
    });
  } catch (error) {
    // Log the error details
    logRequest({
      req,
      res,
      message: "Error in root route",
      error,
      label: "RootRoute",
    });
    // Pass the error to the next middleware
    next(error);
  }
});

// ------------------------------------------------------
// Health Route
// ------------------------------------------------------
router
  .route("/health")
  .get((req: Request, res: Response, next: NextFunction) => {
    try {
      // Determine database connection status
      const dbState =
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

      // Send a success response with health status
      successResponse(req, res, 200, "Health Check Successful", {
        status: "ok", // Health status
        service: "LekhanX - AI Blogging Platform", // Updated service name
        environment: config.NODE_ENV, // Current environment
        database: dbState, // Database connection status
        uptime: process.uptime(), // Application uptime in seconds
        memoryUsage: `${process.memoryUsage().heapUsed / 1024 / 1024} MB`, // Memory usage in MB
        timestamp: new Date().toISOString(), // Current timestamp
      });
    } catch (error) {
      // Log the error details
      logRequest({
        req,
        res,
        message: "Error in health route",
        error,
        label: "HealthRoute",
      });
      // Pass the error to the next middleware
      next(error);
    }
  });

// ------------------------------------------------------
// Index Route
// ------------------------------------------------------

// ------------------------------------------------------
// Not Found Route
// ------------------------------------------------------
router.use((req: Request, res: Response, next: NextFunction) => {
  logRequest({
    req,
    res,
    message: `Route not found: ${req.originalUrl}`,
    label: "NotFoundRoute",
  });
  next(
    new APIError(404, "Not Found", {
      type: "NOT_FOUND",
      details: [
        {
          field: "route",
          message: `The route ${req.originalUrl} does not exist`,
        },
      ],
    })
  );
});

export default router;
