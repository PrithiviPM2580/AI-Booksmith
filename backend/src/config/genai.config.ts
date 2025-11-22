// ============================================================
// 🧩 GenaiConfig — Configuration for Generative AI
// ============================================================
import { GoogleGenAI } from "@google/genai";
import config from "@/config/env.config.js";

// ------------------------------------------------------
// Initialize GoogleGenAI instance
// ------------------------------------------------------
const ai = new GoogleGenAI({
	apiKey: config.GENAI_API_KEY, // API key from environment configuration
});

export default ai;
