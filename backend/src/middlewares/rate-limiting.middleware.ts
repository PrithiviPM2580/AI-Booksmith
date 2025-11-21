// ============================================================
// 🧩 RateLimitingMiddleware — Rate Limiting Middleware
// ============================================================

import type { NextFunction, Request, Response } from "express";
import {
  type IRateLimiterOptions,
  RateLimiterMemory,
  RateLimiterRes,
} from "rate-limiter-flexible";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { keyGetter } from "@/utils/index.util.js";

// Auth - Rate Limiter Options
const authOptions: IRateLimiterOptions = {
  points: 20, // admin gets high limit
  duration: 60, // per minute
  blockDuration: 300, // block for 5 minutes if consumed
};

// User - Rate Limiter Options
const userOptions: IRateLimiterOptions = {
  points: 50, // normal user lowest
  duration: 60, // per minute
  blockDuration: 300, // block for 5 minutes if consumed
};

// API - Rate Limiter Options
const apiOptions: IRateLimiterOptions = {
  points: 100, // api moderate
  duration: 60, // per minute
  blockDuration: 300, // block for 5 minutes if consumed
};

// ------------------------------------------------------
// limiters{} — Different rate limiters based on user roles
// ------------------------------------------------------
export const limiters = {
  auth: new RateLimiterMemory(authOptions),
  user: new RateLimiterMemory(userOptions),
  api: new RateLimiterMemory(apiOptions),
};

// ------------------------------------------------------
// rateLimitingMiddleware() — Middleware to apply rate limiting based on user roles
// ------------------------------------------------------
export const rateLimitingMiddleware =
  (limiter: RateLimiterMemory, getKey: (req: Request) => string = keyGetter) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Get the key for rate limiting (userId or IP)
    const key = getKey(req);

    try {
      // Consume 1 point for each request
      const rateLimitRes: RateLimiterRes = await limiter.consume(key);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": limiter.points.toString(), // total points
        "X-RateLimit-Remaining": rateLimitRes.remainingPoints.toLocaleString(), // remaining points
        "X-RateLimit-Reset": new Date(
          Date.now() + rateLimitRes.msBeforeNext
        ).toUTCString(), // reset time
      });

      next();
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        // If rate limit is exceeded
        res.set({
          "Retry-After": Math.ceil(error.msBeforeNext / 1000).toString(), // in seconds
          "X-RateLimit-Limit": limiter.points.toString(), // total points
          "X-RateLimit-Remaining": "0", // remaining points
          "X-RateLimit-Reset": new Date(
            Date.now() + error.msBeforeNext
          ).toUTCString(), // reset time
        });

        // Log the rate limit exceedance
        logger.warn(
          `Rate limit exceeded: key=${key}, limit=${limiter.points}, resetIn=${error.msBeforeNext}ms`
        );

        // Respond with 429 Too Many Requests
        return next(
          new APIError(429, "Too Many Requests - Please try again later")
        );
      }

      // Log unexpected errors
      logger.error("Rate limiting error", {
        label: "RateLimitingMiddleware",
        error,
      });
      return next(error);
    }
  };
