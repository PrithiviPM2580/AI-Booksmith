// ============================================================
// 🧩 AIService — Handles AI-related business logic
// ============================================================

import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { generateAIContent } from "@/utils/index.util.js";
import type {
	GenerateChapterContentInput,
	GenerateOutlineInput,
} from "@/validator/ai.validator.js";

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
	const text = await generateAIContent(prompt, "application/json");

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
	let outline: { title: string; description: string }[];
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

// ------------------------------------------------------
// generateChapterContentService() — Generates chapter content
// ------------------------------------------------------
export const generateChapterContentService = async (
	chapterContent: GenerateChapterContentInput,
) => {
	// Destructure input parameters
	const { chapterTitle, chapterDescription, style } = chapterContent;

	// Validate required input
	if (!chapterTitle) {
		// Log error and throw APIError for missing chapter title
		logger.error("Chapter title is required for generating chapter content", {
			label: "AIService",
		});

		// Throw APIError for missing chapter title
		throw new APIError(
			400,
			"Chapter title is required for generating chapter content",
			{
				type: "InvalidInput",
				details: [
					{
						field: "chapterTitle",
						message: "Chapter title cannot be empty",
					},
				],
			},
		);
	}

	// Construct prompt for AI model
	const prompt = `You are an expert writer specilizing in ${style} content. Write a complete chapter for a book with the followinf specifications:
     Chapter Title: ${chapterTitle}
     ${chapterDescription ? `Chapter Description: ${chapterDescription}` : ""}
     Writing Style: ${style}
     Target Length: Comphrehensive and datailed (aim for 1500-2500 words)
  
     Requirements: 
     1. Write in a ${style?.toLowerCase()} tone through out the chapter.
     2. Structure the content with clear sections and smooth transitions.
     3. Include relevant examples, explanations, and anecdotes  as appropriate for the style.
     4. Ensure the content flows logically from introduction to conclusion.
     5. Make the content engaging and informative for the reader.
     ${
				chapterDescription
					? "6. Cover all points mentioned in the chapter description."
					: ""
			}
  
     Format Guidelines:
     - Start with compelling opening paragraph.
     - Use clear paragraph breaks for readiability.
     - Include subheadings if appropriate for the content length.
     - End with the strong conclusion or transition to the next chapter.
     - Write in plain text without markdown or special formatting.
  
     Begin writing the chapter now.
  `;

	// Call the AI content generation utility
	const content = await generateAIContent(prompt, "text/plain");

	// Handle cases where AI does not return any content
	if (!content) {
		// Log error and throw APIError for missing AI response
		logger.error("No response from AI for chapter content generation", {
			label: "AIService",
		});

		// Throw APIError for missing AI response
		throw new APIError(
			500,
			"No response from AI for chapter content generation",
			{
				type: "AIResponseError",
				details: [
					{
						field: "aiResponse",
						message: "AI did not return any content",
					},
				],
			},
		);
	}

	// Return the generated chapter content
	return content;
};
