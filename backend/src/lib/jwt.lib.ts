// ============================================================
// 🧩 JWTLib — Handles JSON Web Token operations
// ============================================================
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "@/config/env.config.js";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";

// ------------------------------------------------------
// signToken() — Signs a JSON Web Token
// ------------------------------------------------------
const signToken = <T extends object>(
  payload: T,
  secret: string,
  expiresIn: string | number
): string => {
  // Sign and return the token
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

// ------------------------------------------------------
// verifyToken() — Verifies a JSON Web Token
// ------------------------------------------------------
const verifyToken = <T extends object>(token: string, secret: string): T => {
  try {
    // Verify and return the decoded token payload
    return jwt.verify(token, secret) as T;
  } catch (error) {
    // Log the error and throw an APIError for invalid or expired tokens
    logger.error("Token verification failed:", {
      label: "JWT_LIB",
      error: (error as Error).message,
    });

    // Throw APIError
    throw new APIError(401, "Invalid or expired token", {
      type: "TokenError",
      details: [
        {
          field: "token",
          message: "The provided token is invalid or has expired.",
        },
      ],
    });
  }
};

// ------------------------------------------------------
// jwtLib{} — Handles JWT operations
// ------------------------------------------------------
const jwtLib = {
  // ------------------------------------------------------
  // generateAccessToken() — Generates an access token
  // ------------------------------------------------------
  generateAccessToken(payload: TokenPayload) {
    // Generate and return the access token
    return signToken(
      payload, // payload
      config.JWT_ACCESS_TOKEN_SECRET, // secret
      config.JWT_ACCESS_TOKEN_EXPIRATION // expiration
    );
  },

  // ------------------------------------------------------
  // generateRefreshToken() — Generates a refresh token
  // ------------------------------------------------------
  generateRefreshToken(payload: TokenPayload) {
    // Generate and return the refresh token
    return signToken(
      payload, // payload
      config.JWT_REFRESH_TOKEN_SECRET, // secret
      config.JWT_REFRESH_TOKEN_EXPIRATION // expiration
    );
  },

  // ------------------------------------------------------
  // verifyAccessToken() — Verifies an access token
  // ------------------------------------------------------
  verifyAccessToken(token: string) {
    // Verify and return the decoded access token payload
    return verifyToken<TokenPayload>(token, config.JWT_ACCESS_TOKEN_SECRET);
  },
  // ------------------------------------------------------
  // verifyRefreshToken() — Verifies a refresh token
  // ------------------------------------------------------
  verifyRefreshToken(token: string) {
    // Verify and return the decoded refresh token payload
    return verifyToken<TokenPayload>(token, config.JWT_REFRESH_TOKEN_SECRET);
  },
};

export default jwtLib;
