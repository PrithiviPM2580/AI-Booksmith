// ============================================================
// 🧩 AuthService — Handles authentication-related business logic
// ============================================================
import type { Request } from "express";
import {
  createToken,
  createUser,
  deleteRefreshToken,
  findUserByEmail,
  findUserById,
  findUserByIdLean,
  isTokenExist,
  isUserExistsByEmail,
} from "@/dao/auth.dao.js";
import APIError from "@/lib/api-error.lib.js";
import jwtLib from "@/lib/jwt.lib.js";
import logger from "@/lib/logger.lib.js";
import {
  generateMongooseId,
  getRefreshTokenExpiryDate,
} from "@/utils/index.util.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "@/validator/auth.validator.js";

// ------------------------------------------------------
// registerService() — Registers a new user
// ------------------------------------------------------
export const registerService = async (
  userData: RegisterInput,
  req: Request
) => {
  // Extract user data
  const { email } = userData;

  // Check if user already exists
  const userExists = await isUserExistsByEmail(email);

  // Handle existing user case
  if (userExists) {
    //  Log the attempt for monitoring
    logger.warn(`Signup attempt with existing email: ${email}`, {
      label: "AuthService",
    });

    // Throw conflict error
    throw new APIError(409, "Email already in use", {
      type: "Conflict",
      details: [
        {
          field: "email",
          message: "A user with this email already exists",
        },
      ],
    });
  }

  // Create new user ID
  const _id = generateMongooseId();

  // Create the new user
  const newUser = await createUser({
    _id,
    ...userData,
  });

  // Generate access token
  const accessToken = jwtLib.generateAccessToken({
    userId: newUser._id,
    role: newUser.role,
  });

  // Generate refresh token
  const refreshToken = jwtLib.generateRefreshToken({
    userId: newUser._id,
    role: newUser.role,
  });

  // Store refresh token in database
  await createToken({
    _id: generateMongooseId(),
    userId: newUser._id,
    token: refreshToken,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket.remoteAddress || "",
    expiresAt: getRefreshTokenExpiryDate(),
  });

  // Return user and tokens
  return {
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    accessToken,
    refreshToken,
  };
};

// ------------------------------------------------------
// loginService() — Authenticates a user and generates tokens
// ------------------------------------------------------
export const loginService = async (loginData: LoginInput, req: Request) => {
  // Extract email and password
  const { email, password } = loginData;

  // Find user by email
  const user = await findUserByEmail(email);

  // Handle user not found case
  if (!user) {
    // Log the failed login attempt
    logger.error(`Login attempt with non-existing email: ${email}`, {
      label: "AuthService",
    });

    // Throw authentication error
    throw new APIError(401, "Invalid email or password", {
      type: "AuthenticationError",
      details: [
        {
          field: "email",
          message: "No user found with this email",
        },
      ],
    });
  }

  // Verify password
  if (!user.comparePassword) {
    // Log the missing method error
    logger.error(
      `Password comparison method not found for intern with email: ${email}`,
      {
        label: "AuthService",
      }
    );

    // Throw internal server error
    throw new APIError(500, "Internal Server Error", {
      type: "InternalError",
      details: [
        {
          field: "password",
          message: "Password comparison method not implemented",
        },
      ],
    });
  }

  // Check if the provided password is valid
  const isPasswordValid = await user.comparePassword(password);

  // Handle invalid password case
  if (!isPasswordValid) {
    // Log the invalid password attempt
    logger.warn(`Invalid password attempt for email: ${email}`, {
      label: "AuthService",
    });

    // Throw authentication error
    throw new APIError(401, "Invalid email or password", {
      type: "AuthenticationError",
      details: [
        {
          field: "password",
          message: "Incorrect password",
        },
      ],
    });
  }

  // Generate access token
  const accessToken = jwtLib.generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  // Generate refresh token
  const refreshToken = jwtLib.generateRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  // Store refresh token in database
  await createToken({
    _id: generateMongooseId(),
    userId: user._id,
    token: refreshToken,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket.remoteAddress || "",
    expiresAt: getRefreshTokenExpiryDate(),
  });

  // Return user and tokens
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// ------------------------------------------------------
// logoutService() — Handles user logout
// ------------------------------------------------------
export const logoutService = async (token: string): Promise<boolean> => {
  // Handle missing token case
  if (!token) {
    // Log the missing token scenario
    logger.warn("Logout attempt without a token", {
      label: "AuthService",
    });

    // Throw error for missing token
    throw new APIError(400, "Token is required for logout", {
      type: "TokenMissing",
      details: [
        {
          field: "token",
          message: "A valid token must be provided for logout",
        },
      ],
    });
  }

  // Delete the refresh token from the database
  const deleteToken = await deleteRefreshToken(token);

  // Handle deletion failure
  if (!deleteToken.acknowledged) {
    // Log the failure for debugging
    logger.error("Failed to delete refresh token during logout", {
      label: "AuthService",
    });

    // Throw error for deletion failure
    throw new APIError(500, "Failed to logout user", {
      type: "LogoutError",
      details: [
        {
          field: "token",
          message: "Failed to delete refresh token during logout",
        },
      ],
    });
  }

  // Return success
  return true;
};

// ------------------------------------------------------
// refreshTokenService() — Handles token refresh
// ------------------------------------------------------
export const refreshTokenService = async (oldToken: string, req: Request) => {
  // Verify and decode the old refresh token
  const jwtPayload = jwtLib.verifyRefreshToken(oldToken) as TokenPayload;

  // Check if the old token exists in the database
  const isToken = await isTokenExist(oldToken);

  // Handle non-existing token case
  if (!isToken) {
    // Log the invalid token scenario
    logger.warn(`Refresh token does not exist in DB`, {
      label: "AuthService",
    });

    // Throw error for invalid token
    throw new APIError(401, "Invalid refresh token", {
      type: "UnauthorizedError",
      details: [
        {
          field: "refreshToken",
          message: "The provided refresh token is invalid or has been revoked",
        },
      ],
    });
  }

  // Generate new access token
  const newAccessToken = jwtLib.generateAccessToken({
    userId: jwtPayload.userId,
    role: jwtPayload.role,
  });

  // Generate new refresh token
  const newRefreshToken = jwtLib.generateRefreshToken({
    userId: jwtPayload.userId,
    role: jwtPayload.role,
  });

  // Delete the old refresh token and store the new one
  await deleteRefreshToken(oldToken);

  // Store new refresh token in database
  await createToken({
    _id: generateMongooseId(),
    userId: jwtPayload.userId,
    token: newRefreshToken,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket.remoteAddress || "",
    expiresAt: getRefreshTokenExpiryDate(),
  });

  // Return the new tokens
  return { newAccessToken, newRefreshToken };
};

// ------------------------------------------------------
// getProfileService() —
// ------------------------------------------------------
export const getProfileService = async (userId: string) => {
  // Validate presence of user ID
  if (!userId) {
    // Log the missing user ID scenario
    logger.error("User ID is required to fetch profile", {
      label: "AuthService",
    });

    // Return error for missing user ID
    throw new APIError(400, "User ID is required to fetch profile", {
      type: "BadRequest",
      details: [
        {
          field: "userId",
          message: "User ID cannot be empty",
        },
      ],
    });
  }

  // Fetch user by ID
  const user = await findUserByIdLean(userId);

  // Handle user not found case
  if (!user) {
    // Log the user not found scenario
    logger.warn(`User not found with ID: ${userId}`, {
      label: "AuthService",
    });

    // Return error for user not found
    throw new APIError(404, "User not found", {
      type: "NotFound",
      details: [
        {
          field: "userId",
          message: "No user exists with the provided ID",
        },
      ],
    });
  }

  // Return the fetched user profile
  return user;
};

// ------------------------------------------------------
// updateProfileService() — Handles user profile updates
// ------------------------------------------------------
export const updateProfileService = async (
  userId: string,
  updateData: UpdateProfileInput
) => {
  // Validate presence of user ID
  if (!userId) {
    // Log the missing user ID scenario
    logger.error("User ID is required to update profile", {
      label: "AuthService",
    });

    // Return error for missing user ID
    throw new APIError(400, "User ID is required to update profile", {
      type: "BadRequest",
      details: [
        {
          field: "userId",
          message: "User ID cannot be empty",
        },
      ],
    });
  }

  // Fetch user by ID
  const user = await findUserById(userId);

  // Handle user not found case
  if (!user) {
    // Log the user not found scenario
    logger.warn(`User not found with ID: ${userId}`, {
      label: "AuthService",
    });

    // Return error for user not found
    throw new APIError(404, "User not found", {
      type: "NotFound",
      details: [
        {
          field: "userId",
          message: "No user exists with the provided ID",
        },
      ],
    });
  }

  // Update user fields with provided data or retain existing values
  Object.assign(user, {
    name: updateData.name ?? user.name,
    email: updateData.email ?? user.email,
    avatarUrl: updateData.avatarUrl ?? user.avatarUrl,
  });

  // Save the updated user profile
  await user.save();

  // Return the updated user profile
  return {
    updateUser: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isPro: user.isPro,
    },
  };
};
