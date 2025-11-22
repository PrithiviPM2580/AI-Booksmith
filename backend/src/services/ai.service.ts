// ============================================================
// 🧩 AIService — Handles AI-related business logic
// ============================================================

import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { generateAIContent } from "@/utils/index.util.js";
import { GenerateOutlineInput } from "@/validator/ai.validator.js";

// ------------------------------------------------------
// generateOutlineService() — Generates an outline based on input
// ------------------------------------------------------
export const generateOutlineService = async (input: GenerateOutlineInput) => {
  // Destructure input parameters
  const { topic, style, numChapters, description } = input;

  // Validate required input
  if (!topic) {
    // Log error and throw APIError for missing topic
    logger.error("Topic is required for generating an outline", {
      label: "AIService",
    });

    //  Throw APIError for missing topic
    throw new APIError(400, "Topic is required for generating an outline", {
      type: "InvalidInput",
      details: [
        {
          field: "topic",
          message: "Topic cannot be empty",
        },
      ],
    });
  }

  // Construct prompt for AI model
  const prompt = `You are an expert book outline generator. Create a comphrehensive book outline based on the following requirements:
    Topic: ${topic}
    ${description ? `Description: ${description}` : ""}
    Writing Style: ${style}
    Number of Chapters: ${numChapters || 5}
    
    Requirements:
    1. Generate exactly ${numChapters || 5} chapters.
    2. Each chapter title should be clear, engaging and follow a logical progression.
    3. Each chapter desc should be 2-3 sentences explaing what the chapter covers.
    4. Ensures chapters build upon each other coherently.
    5. Match the ${style} writing style in your titles and descriptions.
    
    Output Format: 
    Return only a valid JSON array with no additional text, markdown, or formatting. Each object must have exactly two keys: "title" and "description".
    Example Structure:
    [
      {
        "title": "Chapter 1: Introduction to the Topic",
        "description": "This chapter provides an overview of the topic, setting the stage for deeper exploration in subsequent chapters."
      },
      {
        "title": "Chapter 2: Understanding Key Concepts",
        "description": "This chapter delves into the fundamental concepts necessary for grasping the subject matter."
      }
      // Continue for the specified number of chapters
    ]
    
    Generate the outline now.
 `;

  // Call the AI content generation utility
  const text = await generateAIContent(prompt);

  // Handle cases where AI does not return any content
  if (!text) {
    // Log error and throw APIError for missing AI response
    logger.error("No response from AI for outline generation", {
      label: "AIService",
    });

    // Throw APIError for missing AI response
    throw new APIError(500, "No response from AI for outline generation", {
      type: "AIResponseError",
      details: [
        {
          field: "aiResponse",
          message: "AI did not return any content",
        },
      ],
    });
  }

  // Parse the AI response to extract the outline
  let outline;
  try {
    // Attempt to parse the AI response as JSON
    outline = JSON.parse(text);
  } catch (error) {
    // Log error and throw APIError for parsing failure
    logger.error("Failed to parse outline from AI response", {
      label: "AIService",
      error,
    });
    // Throw APIError for parsing failure
    throw new APIError(500, "Failed to parse outline from AI response", {
      type: "AIResponseError",
      details: [
        {
          field: "aiResponse",
          message: "Outline format is incorrect",
        },
      ],
    });
  }

  // Return the generated outline
  return outline;
};
