// ============================================================
// 🧩 App — Main application setup and configuration
// ============================================================

import compression from "compression";
import cookiePaeser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import corsOptions from "@/lib/cors.lib.js";
import globalErrorHandlerMiddleware from "@/middlewares/global-error-handler.middleware.js";
import routes from "@/routes/index.route.js";

// Initialize the Express application
const app: Express = express();
// ------------------------------------------------------
// Middlewares
// ------------------------------------------------------
app.use(cookiePaeser()); // Parse cookies
app.use(compression()); // Enable response compression
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(routes); // Use main application routes
app.use(globalErrorHandlerMiddleware); // Global error handling middleware

export default app;
