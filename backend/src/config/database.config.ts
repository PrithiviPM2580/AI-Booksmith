// ============================================================
// 🧩 DatabaseConfig — Database configuration settings
// ============================================================

import type { Server } from "node:http";
import mongoose, { type ConnectOptions } from "mongoose";
import config from "@/config/env.config.js";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";

// ------------------------------------------------------
// connectOptions{} — Mongoose connection options
// ------------------------------------------------------
const connectOptions: ConnectOptions = {
  dbName: config.DB_NAME, // Database name from environment variables
  appName: config.APP_NAME, // Application name from environment variables
  serverApi: {
    version: "1", // Use Server API version 1
    strict: true, // Enforce strict mode for server API
    deprecationErrors: true, // Report deprecated features as errors
  },
  maxPoolSize: 50, // Maximum number of connections in the pool
  minPoolSize: 1, // Minimum number of connections in the pool
  connectTimeoutMS: 10000, // Connection timeout in milliseconds
  socketTimeoutMS: 45000, // Socket timeout in milliseconds
  retryWrites: true, // Enable retryable writes
};

let isConnected = false; // Track the connection status

// ------------------------------------------------------
// connectToDatabase() — Establishes a connection to the MongoDB database
// ------------------------------------------------------
export const connectToDatabase = async (): Promise<void> => {
  // Validate that DB_URL is provided
  if (!config.DB_URL) {
    // Log the error for missing DB_URL
    logger.error(
      "Database URL (DB_URL) is not defined in environment variables.",
      {
        label: "DatabaseConfig",
      }
    );

    // Throw an APIError for missing DB_URL
    throw new APIError(
      500,
      "Database URL (DB_URL) is not defined in environment variables.",
      {
        type: "DatabaseConfigError",
        details: [
          {
            field: "DB_URL",
            issue: "Missing database URL in environment variables.",
          },
        ],
      }
    );
  }

  // If already connected, skip the connection process
  if (isConnected) return;

  // Attempt to connect to the MongoDB database
  try {
    // Establish the connection using Mongoose
    await mongoose.connect(config.DB_URL, connectOptions);

    // Update the connection status
    isConnected = true;

    // Log successful connection
    logger.info("Successfully connected to the MongoDB database.", {
      label: "DatabaseConfig",
    });
  } catch (error) {
    // Log the error if the connection fails
    logger.error("Failed to connect to the database", {
      label: "DatabaseConfig",
      error,
    });

    // Throw an APIError for connection failure
    throw new APIError(500, "Failed to connect to the database", {
      type: "DatabaseError",
      details: [
        {
          message:
            (error as Error).message ||
            "Unknown error occurred while connecting to database",
        },
      ],
    });
  }
};

// ------------------------------------------------------
// disconnectFromDatabase() — Closes the connection to the MongoDB database
// ------------------------------------------------------
export const disconnectFromDatabase = async (): Promise<void> => {
  // If not connected, skip the disconnection process
  if (!isConnected) return;

  // Attempt to disconnect from the MongoDB database
  try {
    // Close the Mongoose connection
    await mongoose.disconnect();

    // Update the connection status
    isConnected = false;

    // Log successful disconnection
    logger.info("Disconnected from the MongoDB database.", {
      label: "DatabaseConfig",
    });
  } catch (error) {
    // Log the error if the disconnection fails
    logger.error("Failed to disconnect from the database", {
      label: "DatabaseConfig",
      error,
    });

    // Throw an APIError for disconnection failure
    throw new APIError(500, "Failed to disconnect from the database", {
      type: "DatabaseError",
      details: [
        {
          message:
            (error as Error).message ||
            "Unknown error occurred while disconnecting from database",
        },
      ],
    });
  }
};

// ------------------------------------------------------
// gracefullyShutDownDatabase() — Gracefully shuts down the MongoDB database connection
// ------------------------------------------------------
export const gracefullyShutDownDatabase = async (server: Server) => {
  //
  logger.info("Gracefully shutting down database connection...", {
    label: "DatabaseConfig",
  });

  //
  try {
    // Attempt to disconnect from the database
    await disconnectFromDatabase();

    // Log successful shutdown
    logger.info("Database connection closed. Shutting down server...", {
      label: "DatabaseConfig",
    });
  } catch (error) {
    // Log any errors during shutdown
    logger.error("Error during database shutdown", {
      label: "DatabaseConfig",
      error,
    });
  } finally {
    // Close the server after database disconnection
    server.close(() => {
      logger.info("Server closed successfully", { label: "DatabaseConfig" });
      process.exit(0);
    });
  }
};
