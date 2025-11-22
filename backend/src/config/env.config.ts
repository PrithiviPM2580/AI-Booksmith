// ============================================================
// 🧩 EnvConfig — Environment configuration
// ============================================================
import "@/config/loadEnv.config.js";
import validate from "@/lib/validate.lib.js";
import envSchema from "@/validator/env.validator.js";

// ------------------------------------------------------
// validateEnv{} — Validates environment variables
// ------------------------------------------------------
const envConfig = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  APP_NAME: process.env.APP_NAME,
  APP_VERSION: process.env.APP_VERSION,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
  JWT_REFRESH_TOKEN_EXPIRATION: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  CLOUD_STORAGE_CLOUD_NAME: process.env.CLOUD_STORAGE_CLOUD_NAME,
  CLOUD_STORAGE_API_KEY: process.env.CLOUD_STORAGE_API_KEY,
  CLOUD_STORAGE_API_SECRET: process.env.CLOUD_STORAGE_API_SECRET,
  CLOUD_STORAGE_UPLOAD_PREFIX: process.env.CLOUD_STORAGE_UPLOAD_PREFIX,
  GENAI_API_KEY: process.env.GENAI_API_KEY,
};

// Validate and export the environment configuration
const config = validate(envSchema, envConfig);

export default config;
