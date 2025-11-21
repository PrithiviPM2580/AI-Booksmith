// ============================================================
// 🧩 CORSLi — Cross-Origin Resource Sharing Configuration
// ============================================================
import type { CorsOptions } from "cors";
import config from "@/config/env.config.js";
import logger from "@/lib/logger.lib.js";

// Create a Set for faster lookup of whitelisted origins
const whiteListSet = new Set(config.CORS_ORIGIN);

// ------------------------------------------------------
// corsOptions{} — Cross-Origin Resource Sharing Options
// ------------------------------------------------------
const corsOptions: CorsOptions = {
	// Dynamic origin validation function
	origin(origin, callback) {
		// 1) No Origin header (non-browser client) → allow
		if (!origin) return callback(null, true);

		// 2) 'null' origin (file://, sandboxed frames) — allow only in dev
		if (origin === "null") {
			if (config.NODE_ENV === "development") return callback(null, true);
			logger.warn("CORS Rejected: null origin");
			return callback(new Error("Not allowed by CORS"));
		}

		// 3) Normalize origin for comparison
		const normalized = origin.replace(/\/$/, "").toLowerCase();

		// 4) Allow in development or if in whitelist
		if (config.NODE_ENV === "development" || whiteListSet.has(normalized)) {
			return callback(null, true);
		}

		// 5) Reject and log (return error so it's visible)
		logger.warn(`CORS Rejected Origin: ${origin}`);
		return callback(new Error("Not allowed by CORS"));
	},

	// Allowed HTTP methods
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

	// Allowed headers in requests
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
	],

	// Headers exposed to the browser
	exposedHeaders: ["Content-Length"],

	// Enable credentials (cookies, authorization headers, etc.)
	credentials: true,

	// Preflight request cache duration (in seconds)
	optionsSuccessStatus: 200,
};

export default corsOptions;
