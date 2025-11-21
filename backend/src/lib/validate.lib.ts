// ============================================================
// 🧩 ValidateLib — Validation lib using Zod
// ============================================================

import type { z } from "zod";
import APIError from "@/lib/api-error.lib.js";

// ------------------------------------------------------
// validate() — Validates data against a Zod schema
// ------------------------------------------------------
const validate = <T extends z.ZodTypeAny>(
	schema: T,
	data: unknown,
): z.infer<T> => {
	// Parse the data using the provided schema
	const parsed = schema.safeParse(data);

	// If validation fails, map the issues and throw an error
	if (!parsed.success) {
		const issues = parsed.error.issues.map((issue) => ({
			field: issue.path.join("."),
			mesage: issue.message,
		}));
		// Throw a structured API error with validation details
		throw new APIError(400, "Validation Error", {
			type: "ValidationError",
			details: issues,
		});
	}

	// Return the validated data
	return parsed.data;
};

export default validate;
