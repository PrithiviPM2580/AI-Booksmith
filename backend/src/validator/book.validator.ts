// ============================================================
// 🧩 BookValidator — Validates book-related data
// ============================================================
import { z } from "zod";

// ------------------------------------------------------
// createBookSchema{} —
// ------------------------------------------------------
export const createBookSchema = {
  body: z.object({
    title: z.string("Title must be a string").min(1, "Title is required"),
    subtitle: z.string("Subtitle must be a string").optional(),
    author: z.string("Author must be a string").min(1, "Author is required"),
    chapters: z
      .array(
        z.object({
          title: z
            .string("Chapter title must be a string")
            .min(1, "Chapter title is required"),
          description: z
            .string("Chapter description must be a string")
            .optional(),
          content: z.string("Chapter content must be a string").optional(),
        })
      )
      .optional(),
  }),
};

// ------------------------------------------------------
// Define the type defination of the schemas
// ------------------------------------------------------
export type CreateBookInput = z.infer<typeof createBookSchema.body>;
