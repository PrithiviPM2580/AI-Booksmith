import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	LOG_LEVEL: z.enum(["error", "warn", "info"]).default("info"),
	DB_URL: z.string().min(1, "DB_URL is required"),
	DB_NAME: z.string().min(1, "DB_NAME is required"),
	APP_NAME: z.string().min(1, "APP_NAME is required"),
	APP_VERSION: z.string().default("1.0.0"),
	ADMIN_EMAIL: z
		.string()
		.default("")
		.transform((email) =>
			email
				.split(",")
				.map((e) => e.trim().toLowerCase())
				.filter((e) => e.length > 0),
		),
	JWT_ACCESS_TOKEN_SECRET: z
		.string()
		.min(1, "JWT_ACCESS_TOKEN_SECRET is required"),
	JWT_REFRESH_TOKEN_SECRET: z
		.string()
		.min(1, "JWT_REFRESH_TOKEN_SECRET is required"),
	JWT_ACCESS_TOKEN_EXPIRATION: z
		.string()
		.min(1, "JWT_ACCESS_TOKEN_EXPIRATION is required")
		.default("15m"),
	JWT_REFRESH_TOKEN_EXPIRATION: z
		.string()
		.min(1, "JWT_REFRESH_TOKEN_EXPIRATION is required")
		.default("7d"),
	CORS_ORIGIN: z
		.string()
		.min(1, "CORS_ORIGIN is required")
		.default("http://localhost:5173"),
	CLOUD_STORAGE_CLOUD_NAME: z
		.string()
		.min(1, "CLOUD_STORAGE_CLOUD_NAME is required"),
	CLOUD_STORAGE_API_KEY: z.string().min(1, "CLOUD_STORAGE_API_KEY is required"),
	CLOUD_STORAGE_API_SECRET: z
		.string()
		.min(1, "CLOUD_STORAGE_API_SECRET is required"),
	CLOUD_STORAGE_UPLOAD_PREFIX: z
		.string()
		.min(1, "CLOUD_STORAGE_UPLOAD_PREFIX is required"),
});

export default envSchema;
