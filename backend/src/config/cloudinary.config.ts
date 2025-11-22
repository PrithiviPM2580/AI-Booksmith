// ============================================================
// 🧩 CloudinaryConfig — Configuration for Cloudinary cloud storage
// ============================================================

import { v2 as cloudinary } from "cloudinary";
import config from "@/config/env.config.js";

// Cloudinary configuration
cloudinary.config({
	cloud_name: config.CLOUD_STORAGE_CLOUD_NAME,
	api_key: config.CLOUD_STORAGE_API_KEY,
	api_secret: config.CLOUD_STORAGE_API_SECRET,
	secure: true,
	upload_prefix: config.CLOUD_STORAGE_UPLOAD_PREFIX,
});

export default cloudinary;
