// ============================================================
// 🧩 ExportService — Handles export-related business logic
// ============================================================
import { findBookById } from "@/dao/book.dao.js";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { Types } from "mongoose";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
} from "docx";
import MarkdownIt from "markdown-it";
import { Response } from "express";
import { DOCX_STYLES, TYPOGRAPHY } from "@/constants/index.constant.js";
import axios from "axios";
import { processMarkdownToDocx, renderMarkdown } from "@/utils/index.util.js";
import PDFDocument from "pdfkit";

// Initialize Markdown-It
const md = new MarkdownIt();

// ------------------------------------------------------
// exportAsDocxService() — Handles exporting content as a DOCX
// ------------------------------------------------------
export const exportAsDocxService = async (
  bookId: string,
  userId: string,
  res: Response
) => {
  // Validate book ID
  if (!bookId) {
    // Log error if book ID is missing
    logger.error("Book ID is missing for DOCX generation", {
      label: "ExportService",
    });

    // Throw API error for missing book ID
    throw new APIError(400, "Book ID is required to generate DOCX", {
      type: "InvalidInput",
      details: [
        {
          field: "bookId",
          message: "Book ID is required",
        },
      ],
    });
  }

  // Convert bookId to ObjectId
  const objectId = new Types.ObjectId(bookId);

  // Fetch book from database
  const book = await findBookById(objectId);

  // Validate book existence and ownership
  if (!book) {
    // Log error if book is not found
    logger.error(`Book not found for ID: ${bookId}`, {
      label: "ExportService",
    });

    // Throw API error for book not found
    throw new APIError(404, "Book not found", {
      type: "NotFound",
      details: [
        {
          field: "bookId",
          message: "No book found with the provided ID",
        },
      ],
    });
  }

  // Check if the book belongs to the requesting user
  if (book.userId.toString() !== userId) {
    // Log error for unauthorized access
    logger.error(`Unauthorized access attempt for book ID: ${bookId}`, {
      label: "ExportService",
    });

    // Throw API error for forbidden access
    throw new APIError(403, "You do not have permission to access this book", {
      type: "Forbidden",
      details: [
        {
          field: "userId",
          message: "User does not own the requested book",
        },
      ],
    });
  }

  // Document sections
  const sections: Paragraph[] = [];

  // Cover Image (Cloudinary)
  if (book.coverImageUrl) {
    try {
      // Fetch image from the Cloudinary URL
      const response = await axios.get<ArrayBuffer>(book.coverImageUrl, {
        responseType: "arraybuffer",
      });

      //Check if response is valid and change to buffer
      const imageBuffer = Buffer.from(response.data);

      // Top spacing
      sections.push(
        new Paragraph({
          text: "",
          spacing: { before: 1000 },
        })
      );

      // Add image to document
      sections.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: 400,
                height: 400,
              },
              type: "png",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Page break after cover image
      sections.push(
        new Paragraph({
          text: "",
          pageBreakBefore: true,
        })
      );
    } catch (error) {
      // Log error if image processing fails
      logger.error("Error fetching or processing cover image", {
        label: "ExportService",
        error,
      });

      // Throw API error for image processing failure
      throw new APIError(500, "Error processing cover image", {
        type: "ImageProcessingError",
        details: [
          {
            field: "coverImageUrl",
            message: "Failed to fetch or process the cover image",
          },
        ],
      });
    }
  }

  // Title page section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: book.title,
          bold: true,
          font: DOCX_STYLES.fonts.heading,
          size: DOCX_STYLES.sizes.title * 2,
          color: "1a202c",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
    })
  );

  // Subtitle Exists
  if (book.subtitle?.trim()) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: book.subtitle,
            font: DOCX_STYLES.fonts.heading,
            size: DOCX_STYLES.sizes.subtitle * 2,
            color: "4a5568",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Author
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `by ${book.author}`,
          font: DOCX_STYLES.fonts.heading,
          size: DOCX_STYLES.sizes.author * 2,
          color: "2d3748",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Decorative Line
  sections.push(
    new Paragraph({
      text: "",
      border: {
        bottom: {
          color: "4f46e5",
          space: 1,
          size: 12,
          style: "single",
        },
      },
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Chapters
  book.chapters?.forEach((chapter, index) => {
    try {
      // Page break before each chapter (except the first)
      if (index > 0) {
        sections.push(
          new Paragraph({
            text: "",
            pageBreakBefore: true,
          })
        );
      }

      // Chapter Title
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: chapter.title || `Chapter ${index + 1}`,
              bold: true,
              font: DOCX_STYLES.fonts.heading,
              size: DOCX_STYLES.sizes.chapterTitle * 2,
              color: "1a202c",
            }),
          ],
          spacing: {
            before: DOCX_STYLES.spacing.chapterBefore,
            after: DOCX_STYLES.spacing.chapterAfter,
          },
        })
      );

      //Chapter Content
      const parsedParagraphs = processMarkdownToDocx(chapter.content || "", md);

      // Append parsed paragraphs to sections
      sections.push(...parsedParagraphs);
    } catch (error) {
      // Log error if chapter processing fails
      logger.error("Error processing chapter for DOCX export", {
        label: "ExportService",
        error,
      });

      // Throw API error for chapter processing failure
      throw new APIError(500, "Error processing chapter content", {
        type: "ContentProcessingError",
        details: [
          {
            field: "chapter",
            message: `Failed to process chapter ${index + 1}`,
          },
        ],
      });
    }
  });
  // Create Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: sections,
      },
    ],
  });

  // Send Document Buffer
  const buffer = await Packer.toBuffer(doc);

  // Set response headers for DOCX file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );

  // Set filename in Content-Disposition header
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${book.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")}.docx`
  );

  // Set Content-Length header
  res.setHeader("Content-Length", buffer.length.toString());

  // Send the DOCX file buffer in the response
  res.end(buffer);
};

// ------------------------------------------------------
// exportAsPDFService() — Export a book as a PDF file
// ------------------------------------------------------
export const exportAsPDFService = async (
  bookId: string,
  userId: string,
  res: Response
) => {
  // Validate book ID
  if (!bookId) {
    // Log error if book ID is missing
    logger.error("Book ID is missing for PDF generation", {
      label: "ExportService",
    });

    // Throw API error for missing book ID
    throw new APIError(400, "Book ID is required to generate PDF", {
      type: "InvalidInput",
      details: [{ field: "bookId", message: "Book ID is required" }],
    });
  }

  // Convert bookId to ObjectId
  const objectId = new Types.ObjectId(bookId);

  // Fetch book from database
  const book = await findBookById(objectId);

  // Validate book existence and ownership
  if (!book) {
    // Log error if book is not found
    logger.error(`Book not found for ID: ${bookId}`, {
      label: "ExportService",
    });

    // Throw API error for book not found
    throw new APIError(404, "Book not found", {
      type: "NotFound",
      details: [{ field: "bookId", message: "No book found" }],
    });
  }

  // Check if the book belongs to the requesting user
  if (book.userId.toString() !== userId) {
    // Log error for unauthorized access
    logger.error(`Unauthorized access attempt for book ID: ${bookId}`, {
      label: "ExportService",
    });

    // Throw API error for forbidden access
    throw new APIError(403, "You do not have permission to access this book", {
      type: "Forbidden",
      details: [{ field: "userId", message: "User does not own this book" }],
    });
  }

  // Create a new PDF document
  const doc = new PDFDocument({
    margins: { top: 72, left: 72, right: 72, bottom: 72 },
    bufferPages: true,
    autoFirstPage: true,
  });

  // Set response headers for PDF file download
  res.setHeader("Content-Type", "application/pdf");

  // Set filename in Content-Disposition header
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${book.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
  );

  // Pipe PDF document to response
  doc.pipe(res);

  // COVER IMAGE (CLOUDINARY)
  if (book.coverImageUrl) {
    try {
      // Fetch image from the Cloudinary URL
      const response = await axios.get<ArrayBuffer>(book.coverImageUrl, {
        responseType: "arraybuffer",
      });

      //Check if response is valid and change to buffer
      const imageBuffer = Buffer.from(response.data);

      const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const pageHeight =
        doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

      // Add image to document, centered and scaled
      doc.image(imageBuffer, {
        fit: [pageWidth * 0.8, pageHeight * 0.8],
        align: "center",
        valign: "center",
      });

      // Add a new page after the cover image
      doc.addPage();
    } catch (error) {
      // Log error if image processing fails
      logger.error("Error fetching or processing cover image", {
        label: "ExportService",
        error,
      });

      // Throw API error for image processing failure
      throw new APIError(500, "Error processing cover image", {
        type: "ImageProcessingError",
        details: [
          { field: "coverImageUrl", message: "Failed to load cover image" },
        ],
      });
    }
  }

  // TITLE PAGE
  doc
    .font(TYPOGRAPHY.fonts.sansBold)
    .fontSize(TYPOGRAPHY.sizes.title)
    .fillColor(TYPOGRAPHY.colors.heading)
    .text(book.title, { align: "center" });

  doc.moveDown(2);

  if (book.subtitle?.trim()) {
    doc
      .font(TYPOGRAPHY.fonts.sans)
      .fontSize(TYPOGRAPHY.sizes.h2)
      .fillColor(TYPOGRAPHY.colors.text)
      .text(book.subtitle, { align: "center" });

    doc.moveDown(1);
  }

  doc
    .font(TYPOGRAPHY.fonts.sans)
    .fontSize(TYPOGRAPHY.sizes.author)
    .fillColor(TYPOGRAPHY.colors.text)
    .text(`by ${book.author}`, { align: "center" });

  // CHAPTERS
  if (Array.isArray(book.chapters) && book.chapters.length > 0) {
    book.chapters.forEach((chapter, index) => {
      try {
        doc.addPage();

        doc
          .font(TYPOGRAPHY.fonts.sansBold)
          .fontSize(TYPOGRAPHY.sizes.chapterTitle)
          .fillColor(TYPOGRAPHY.colors.heading)
          .text(chapter.title || `Chapter ${index + 1}`, {
            align: "left",
          });

        doc.moveDown(1.5);

        if (chapter.content?.trim()) {
          // Render chapter content from Markdown to PDF
          renderMarkdown({ doc, markdown: chapter.content, md });
        }
      } catch (error) {
        // Log error if chapter processing fails
        logger.error("Error processing chapter for PDF export", {
          label: "ExportService",
          error,
        });

        // Throw API error for chapter processing failure
        throw new APIError(500, "Error processing chapter content", {
          type: "ContentProcessingError",
          details: [
            {
              field: "chapter",
              message: `Failed to process chapter ${index + 1}`,
            },
          ],
        });
      }
    });
  }

  // Finalize PDF and end the stream
  doc.end();
};
