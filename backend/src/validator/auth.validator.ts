// ============================================================
// 🧩 AuthValidator — Validation for authentication routes
// ============================================================
import { z } from "zod";

// ------------------------------------------------------
// registerSchema{} — Validation schema for user registration
// ------------------------------------------------------
export const registerSchema = {
	body: z
		.object({
			name: z.string().min(3, "Name must be at least 3 characters long"),
			email: z.email("Invalid email format"),
			password: z
				.string()
				.min(6, "Password must be at least 6 characters long"),
		})
		.strict(),
};

// ------------------------------------------------------
// loginSchema{} — Validation schema for user login
// ------------------------------------------------------
export const loginSchema = {
	body: z
		.object({
			email: z.string().email("Invalid email format"),
			password: z
				.string()
				.min(6, "Password must be at least 6 characters long"),
		})
		.strict(),
};

// ------------------------------------------------------
// Define the type defination of the schemas
// ------------------------------------------------------
export type RegisterInput = z.infer<typeof registerSchema.body>;
export type LoginInput = z.infer<typeof loginSchema.body>;
