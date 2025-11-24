// ============================================================
// 🧩 ExportValidator — Validates export-related inputs
// ============================================================
import { z } from "zod";

// ------------------------------------------------------
// exportDocxSchema {} — Schema for exporting as DOCX
// ------------------------------------------------------
export const exportDocxSchema = {
  params: z.object({
    bookId: z.string("Book ID must be a string").min(1, "Book ID is required"),
  }),
};

// ------------------------------------------------------
// exportPdfSchema {} — Schema for exporting as PDF
// ------------------------------------------------------
export const exportPdfSchema = {
  params: z.object({
    bookId: z.string("Book ID must be a string").min(1, "Book ID is required"),
  }),
};

// ------------------------------------------------------
// Define the type defination of the schemas
// ------------------------------------------------------
export type ExportDocxParams = z.infer<typeof exportDocxSchema.params>;
export type ExportPdfParams = z.infer<typeof exportPdfSchema.params>;
