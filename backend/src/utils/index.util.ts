// ============================================================
// 🧩 IndexUtils — Utility functions for index operations
// ============================================================

import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { z } from "zod";
import cloudinary from "@/config/cloudinary.config.js";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import ai from "@/config/genai.config.js";

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
// successResponse() — Sends a standardized success response
// ------------------------------------------------------
export const successResponse = <T>(
  res: Response,
  statusCode: number = 200,
  message: string = "Success",
  data?: T
) => {
  // Log the success response details
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

// ------------------------------------------------------
// uploadToCloudinary() — Uploads a file to Cloudinary cloud storage
// ------------------------------------------------------
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "books"
): Promise<string> => {
  // Upload the file buffer to Cloudinary and return the result
  return await new Promise((resolve, reject) => {
    // Use Cloudinary's upload_stream method to upload the file
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          format: "webp",
          resource_type: "image",
        },
        (error, result) => {
          // Handle upload result or error
          if (error) return reject(error);

          // Ensure result and secure_url are valid
          if (!result || !result.secure_url) {
            // Log the error if no URL is returned
            logger.error("Cloudinary upload failed: No URL returned", {
              label: "CloudinaryUploadError",
            });

            // Reject the promise with an APIError
            return reject(
              new APIError(500, "Cloudinary upload failed: No URL returned", {
                label: "CloudinaryUploadError",
                details: [
                  {
                    field: "cloudinary",
                    message: "No secure URL returned from Cloudinary",
                  },
                ],
              })
            );
          }

          // Resolve the promise with the secure URL of the uploaded file
          resolve(result?.secure_url);
        }
      )
      .end(fileBuffer); // End the stream with the file buffer
  });
};

// ------------------------------------------------------
// generateAIContent() — Generates AI content based on input
// ------------------------------------------------------
export const generateAIContent = async (prompt: string) => {
  // Generate content using the AI model and return the result
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Specify the AI model to use
    contents: prompt, // Provide the prompt for content generation
    config: {
      responseMimeType: "application/json", // Expect JSON response
    },
  });

  // Return the generated text from the AI model
  return result.text;
};
