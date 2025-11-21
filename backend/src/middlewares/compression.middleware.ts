// ============================================================
// 🧩 CompressionMiddleware — Production-Optimized Compression
// ============================================================

import zlib from "node:zlib";
import compression from "compression";
import type { Request, Response } from "express";

// ------------------------------------------------------
// shouldCompress() — Determines if response should be compressed
// ------------------------------------------------------
const shouldCompress = (req: Request, res: Response): boolean => {
	// Skip compression if already encoded
	if (res.getHeader("Content-Encoding")) return false;

	// Client says “no compression”
	if (req.headers["x-no-compression"]) return false;

	// Skip compression for large binary media
	const rawType = res.getHeader("Content-Type") || "";
	const type = Array.isArray(rawType)
		? rawType.join(";").toLowerCase()
		: rawType.toString().toLowerCase();

	if (
		type.startsWith("image/") ||
		type.startsWith("video/") ||
		type.startsWith("audio/") ||
		type.startsWith("application/zip") ||
		type.startsWith("application/pdf")
	) {
		return false;
	}

	// Default compression behavior
	return compression.filter(req, res);
};

// ------------------------------------------------------
// compressionMiddleware() — Compression middleware configuration
// ------------------------------------------------------
const compressionMiddleware = compression({
	threshold: "1kb", // only compress responses ≥ 1kb

	// Brotli settings (safe defaults)
	brotli: {
		params: {
			[zlib.constants.BROTLI_PARAM_QUALITY]: 5, // good balance between speed + size
		},
	},

	filter: shouldCompress,

	// Gzip fallback settings
	level: 6, // good balance between CPU + compression
});

export default compressionMiddleware;
