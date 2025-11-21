// ============================================================
// 🧩 LoadEnvConfig — Loads environment variables configuration
// ============================================================

import path from "node:path";
import dotenv from "dotenv";

const ENV = process.env.NODE_ENV || "development";

const envFile = `.env.${ENV}`;

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});
