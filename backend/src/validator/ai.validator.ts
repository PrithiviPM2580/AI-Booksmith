// ============================================================
// 🧩 AIValidator — Validates AI-related input and data
// ============================================================
import { z } from "zod";

// ------------------------------------------------------
// generateOutlineSchema — Validates the input for generating an outline
// ------------------------------------------------------
export const generateOutlineSchema = {
  body: z.object({
    topic: z.string().min(5).max(100),
    style: z.string().optional(),
    numChapters: z.number().min(1).max(50).optional(),
    description: z.string().min(10).max(500).optional(),
  }),
};

// ------------------------------------------------------
// generateChapterContentSchema — Validates the input for generating chapter content
// ------------------------------------------------------
export const generateChapterContentSchema = {
  body: z.object({
    chapterTitle: z.string().min(5).max(100),
    chapterDescription: z.string().min(10).max(500).optional(),
    style: z.string().optional(),
  }),
};

// ------------------------------------------------------
// Define the type defination of the schemas
// ------------------------------------------------------
export type GenerateOutlineInput = z.infer<typeof generateOutlineSchema.body>;
export type GenerateChapterContentInput = z.infer<
  typeof generateChapterContentSchema.body
>;
