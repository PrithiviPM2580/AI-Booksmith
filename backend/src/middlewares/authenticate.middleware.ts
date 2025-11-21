// ============================================================
// 🧩 AuthenticateMiddleware — Middleware to authenticate users
// ============================================================
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import APIError from "@/lib/api-error.lib.js";
import jwtLib from "@/lib/jwt.lib.js";
import logger from "@/lib/logger.lib.js";

// JWT Error classes
const { TokenExpiredError, JsonWebTokenError } = jwt;

// ------------------------------------------------------
// authenticateMiddleware() — Middleware to authenticate users
// ------------------------------------------------------
const authenticateMiddleware =
  (allowRoles: Role[] = []) =>
  (req: Request, _res: Response, next: NextFunction) => {
    // Extract the Authorization header
    const { authorization } = req.headers;

    // Check if the Authorization header is present
    if (!authorization) {
      // If the Authorization header is missing, log a warning and return an error
      logger.warn("Authorization header missing", {
        label: "AuthenticateMiddleware",
      });

      // Return an error indicating the missing Authorization header
      return next(
        new APIError(401, "Authorization header missing", {
          type: "AuthorizationHeaderMissing",
          details: [
            {
              field: "authorization",
              message: "Authorization header is required",
            },
          ],
        })
      );
    }

    // Split the Authorization header to extract the token
    const [schema, token] = authorization.split(" ");

    // Check if the schema is 'Bearer' and the token is present
    if (schema !== "Bearer" || !token) {
      // If the schema is not 'Bearer' or the token is missing, log a warning and return an error
      logger.warn("Invalid authorization header format", {
        label: "AuthenticateMiddleware",
      });

      // Return an error indicating the invalid authorization header format
      return next(
        new APIError(401, "Invalid authorization header format", {
          type: "InvalidAuthorizationHeaderFormat",
          details: [
            {
              field: "authorization",
              message: "Expected format: 'Bearer <token>'",
            },
          ],
        })
      );
    }

    try {
      // Verify the token using the jwtLib
      const payload = jwtLib.verifyAccessToken(token) as TokenPayload;

      // Check if the payload contains the required fields
      if (!payload?.userId || !payload?.role) {
        // If the payload is missing required fields, log an error and return an error
        logger.error("Invalid token payload", {
          label: "AuthenticateMiddleware",
          payload,
        });

        // Return an error indicating the invalid token payload
        return next(
          new APIError(401, "Invalid token payload", {
            type: "InvalidTokenPayload",
            details: [
              {
                field: "authorization",
                message: "Invalid token payload",
              },
            ],
          })
        );
      }

      // Attach the user information to the request object
      req.user = {
        userId: payload.userId,
        role: payload.role,
      };

      // Check if the user's role is allowed to access the resource
      if (allowRoles.length > 0 && !allowRoles.includes(payload.role)) {
        // If the user's role is not allowed, log a warning and return an error
        logger.warn("Insufficient role for this resource", {
          label: "AuthenticateMiddleware",
        });

        // Return an error indicating insufficient role
        return next(
          new APIError(403, "Forbidden - Insufficient role", {
            type: "ForbiddenInsufficientRole",
            details: [
              {
                field: "authorization",
                message: "Insufficient role for this resource",
              },
            ],
          })
        );
      }

      // If everything is fine, proceed to the next middleware
      return next();
    } catch (error) {
      // Handle token verification errors
      if (error instanceof TokenExpiredError) {
        // If the token has expired, log a warning and return an error
        logger.warn("AccessToken expired", {
          label: "AuthenticateMiddleware",
        });

        // Return an error indicating the access token has expired
        return next(
          new APIError(401, "AccessToken expired", {
            type: "AccessTokenExpired",
            details: [
              {
                field: "authorization",
                message: "The access token has expired",
              },
            ],
          })
        );
      }

      // Handle invalid token error
      if (error instanceof JsonWebTokenError) {
        // If the token is invalid, log a warning and return an error
        logger.warn("Invalid AccessToken", {
          label: "AuthenticateMiddleware",
        });

        // Return an error indicating the access token is invalid
        return next(
          new APIError(401, "Invalid AccessToken", {
            type: "InvalidAccessToken",
            details: [
              {
                field: "authorization",
                message: "The access token is invalid",
              },
            ],
          })
        );
      }

      // For any other errors, log the error and return a generic error
      logger.error("Token verification failed", {
        label: "AuthenticateMiddleware",
        error,
      });

      // Return a generic error indicating token verification failed
      return next(
        new APIError(401, "Unauthorized - Token Verification Failed", {
          type: "AccessTokenVerificationError",
          details: [
            {
              field: "authorization",
              message: "Token verification failed",
            },
          ],
        })
      );
    }
  };

export default authenticateMiddleware;
