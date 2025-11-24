// ============================================================
// 🧩 IndexUtils — Utility functions for index operations
// ============================================================

import type { Request, Response } from "express";
import { Types } from "mongoose";
import type { z } from "zod";
import cloudinary from "@/config/cloudinary.config.js";
import ai from "@/config/genai.config.js";
import APIError from "@/lib/api-error.lib.js";
import logger from "@/lib/logger.lib.js";
import { TextRun, Paragraph, HeadingLevel, AlignmentType } from "docx";
import { DOCX_STYLES, TYPOGRAPHY } from "@/constants/index.constant.js";
import MarkdownIt from "markdown-it";
import { Token } from "markdown-it/dist/markdown-it.min.js";
import PDFDocument from "pdfkit";

// ------------------------------------------------------
// timeStampToDate() — Returns the current timestamp as an ISO string
// ------------------------------------------------------
export const timeStampToDate = () => {
  return new Date().toISOString();
};

// ------------------------------------------------------
// formatIssues() — Formats validation issues into a readable string
// ------------------------------------------------------
export const formatIssues = (issues: z.ZodError["issues"]) => {
  // Map each issue to an object with field and message
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

// ------------------------------------------------------
// Key getter return the userId or ip for rate-limiting
// ------------------------------------------------------
export const keyGetter = (req: Request): string => {
  // Return user ID if available, otherwise return IP address
  if (req.user?.userId) {
    return `user-${req.user.userId.toString()}`;
  } else {
    return `ip-${req.ip}`;
  }
};

// ------------------------------------------------------
// successResponse() — Sends a standardized success response
// ------------------------------------------------------
export const successResponse = <T>(
  res: Response,
  statusCode: number = 200,
  message: string = "Success",
  data?: T
) => {
  // Log the success response details
  logger.info(`Success Response: ${message}`, {
    label: "SuccessResponse",
    data: data,
  });

  // Send the standardized JSON response
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

// ------------------------------------------------------
// generateMongooseId() — Generates a new Mongoose ObjectId as a string
// ------------------------------------------------------
export const generateMongooseId = (): Types.ObjectId => {
  // Generate and return a new Mongoose ObjectId
  return new Types.ObjectId();
};

// ------------------------------------------------------
// getRefreshTokenExpiryDate() — Description:Returns the expiry date for refresh tokens
// ------------------------------------------------------
export const getRefreshTokenExpiryDate = (): Date => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
};

// ------------------------------------------------------
// uploadToCloudinary() — Uploads a file to Cloudinary cloud storage
// ------------------------------------------------------
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "books"
): Promise<string> => {
  // Upload the file buffer to Cloudinary and return the result
  return await new Promise((resolve, reject) => {
    // Use Cloudinary's upload_stream method to upload the file
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          format: "png",
          resource_type: "image",
        },
        (error, result) => {
          // Handle upload result or error
          if (error) return reject(error);

          // Ensure result and secure_url are valid
          if (!result || !result.secure_url) {
            // Log the error if no URL is returned
            logger.error("Cloudinary upload failed: No URL returned", {
              label: "CloudinaryUploadError",
            });

            // Reject the promise with an APIError
            return reject(
              new APIError(500, "Cloudinary upload failed: No URL returned", {
                label: "CloudinaryUploadError",
                details: [
                  {
                    field: "cloudinary",
                    message: "No secure URL returned from Cloudinary",
                  },
                ],
              })
            );
          }

          // Resolve the promise with the secure URL of the uploaded file
          resolve(result?.secure_url);
        }
      )
      .end(fileBuffer); // End the stream with the file buffer
  });
};

// ------------------------------------------------------
// generateAIContent() — Generates AI content based on input
// ------------------------------------------------------
export const generateAIContent = async (
  prompt: string,
  formatType: FormatType
) => {
  // Generate content using the AI model and return the result
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Specify the AI model to use
    contents: prompt, // Provide the prompt for content generation
    config: {
      responseMimeType: formatType, // Expect JSON response
    },
  });

  // Return the generated text from the AI model
  return result.text;
};

// ------------------------------------------------------
// processInlineContent() — Processes inline Markdown tokens into TextRun objects for DOCX
// ------------------------------------------------------
export const processInlineContent = (children: MarkdownToken[]): TextRun[] => {
  // Array to hold the resulting TextRun objects
  const textRuns: TextRun[] = [];

  // Current formatting state
  let currentFormatting = { bold: false, italic: false };

  let textBuffer = "";

  // Function to flush the text buffer into a TextRun
  const flushText = () => {
    if (textBuffer.trim().length === 0) return;

    //  Create a new TextRun with the current formatting
    textRuns.push(
      new TextRun({
        text: textBuffer,
        bold: currentFormatting.bold,
        italics: currentFormatting.italic,
        font: DOCX_STYLES.fonts.body,
        size: DOCX_STYLES.sizes.body * 2,
      })
    );

    textBuffer = "";
  };

  // Process each child token
  for (const child of children) {
    // Handle different token types for inline formatting
    switch (child.type) {
      case "strong_open":
        flushText();
        currentFormatting.bold = true;
        break;

      case "strong_close":
        flushText();
        currentFormatting.bold = false;
        break;

      case "em_open":
        flushText();
        currentFormatting.italic = true;
        break;

      case "em_close":
        flushText();
        currentFormatting.italic = false;
        break;

      case "text":
        textBuffer += child.content || "";
        break;

      default:
        break;
    }
  }

  // Flush any remaining text in the buffer
  flushText();

  // Return the array of TextRun objects representing the inline content
  return textRuns;
};

// ------------------------------------------------------
// processMarkdownToDocx() — Converts Markdown content into an array of DOCX Paragraphs
// ------------------------------------------------------
export const processMarkdownToDocx = (
  markdown: string,
  md: MarkdownIt
): Paragraph[] => {
  // Parse the markdown content into tokens
  const tokens: MarkdownToken[] = md.parse(markdown, {});

  // Array to hold the resulting Paragraph objects
  const paragraphs: Paragraph[] = [];

  let inList = false; // Flag to track if we are inside a list
  let listType: "bullet" | "ordered" | null = null; // Type of the current list
  let orderedCounter = 1; // Counter for ordered lists

  // Process each token in the markdown
  for (let i = 0; i < tokens.length; i++) {
    // Get the current token
    const token = tokens[i];

    try {
      // Headings (#, ##, ###)
      if (token.type === "heading_open") {
        const level = Number(token.tag?.substring(1));
        const inlineToken = tokens[i + 1];

        if (inlineToken?.type === "inline") {
          let headingLevel;
          let fontSize;

          switch (level) {
            case 1:
              headingLevel = HeadingLevel.HEADING_1;
              fontSize = DOCX_STYLES.sizes.h1;
              break;
            case 2:
              headingLevel = HeadingLevel.HEADING_2;
              fontSize = DOCX_STYLES.sizes.h2;
              break;
            case 3:
              headingLevel = HeadingLevel.HEADING_3;
              fontSize = DOCX_STYLES.sizes.h3;
              break;
            default:
              headingLevel = HeadingLevel.HEADING_1;
              fontSize = DOCX_STYLES.sizes.h3;
          }

          // Create a new Paragraph for the heading
          paragraphs.push(
            new Paragraph({
              text: inlineToken.content ?? "",
              heading: headingLevel,
              spacing: {
                before: DOCX_STYLES.spacing.headingBefore,
                after: DOCX_STYLES.spacing.headingAfter,
              },
            })
          );

          i += 2; //Skip inline + heading close
          continue;
        }
      }

      // Normal Paragraphs
      if (token.type === "paragraph_open") {
        const inlineToken = tokens[i + 1];

        if (inlineToken?.type === "inline" && inlineToken.children) {
          const runs = processInlineContent(inlineToken.children);
          paragraphs.push(
            new Paragraph({
              children: runs,
              spacing: {
                before: inList ? 100 : DOCX_STYLES.spacing.paragraphBefore,
                after: inList ? 100 : DOCX_STYLES.spacing.paragraphAfter,
              },
              alignment: AlignmentType.JUSTIFIED,
            })
          );

          i += 2; // Skip inline and paragraph_close
          continue;
        }
      }

      // Lists (unordered and ordered)
      if (token.type === "bullet_list_open") {
        inList = true;
        listType = "bullet";
        continue;
      }

      if (token.type === "bullet_list_close") {
        inList = false;
        listType = null;

        // Add spacing after list
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        continue;
      }
      if (token.type === "ordered_list_open") {
        inList = true;
        listType = "ordered";
        orderedCounter = 1;
        continue;
      }

      if (token.type === "ordered_list_close") {
        inList = false;
        listType = null;

        // Add spacing after list
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        continue;
      }

      // List Items
      if (token.type === "list_item_open") {
        const inlineToken = tokens[i + 2];

        if (inlineToken?.type === "inline" && inlineToken.children) {
          const runs = processInlineContent(inlineToken.children);

          const bullet =
            listType === "bullet"
              ? "• "
              : listType === "ordered"
              ? `${orderedCounter++}. `
              : "";

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: bullet,
                  font: DOCX_STYLES.fonts.body,
                }),
                ...runs,
              ],
              spacing: { before: 50, after: 50 },
              indent: { left: 720 }, //0.5 inch indent
            })
          );
          i += 4; //Skip paragraph_open,inline,paragraph_close, list_item_close
          continue;
        }
      }

      // Blockquotes
      if (token.type === "blockquote_open") {
        //Find the blockquote content
        const inlineToken = tokens[i + 2];

        if (inlineToken?.type === "inline") {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: inlineToken.content ?? "",
                  italics: true,
                  color: "666666",
                  font: DOCX_STYLES.fonts.body,
                }),
              ],
              spacing: { before: 200, after: 200 },
              indent: { left: 720 },
              alignment: AlignmentType.JUSTIFIED,
              border: {
                left: {
                  color: "4f46e5",
                  space: 1,
                  style: "single",
                  size: 24,
                },
              },
            })
          );
          i += 4; //Skip paragraph_open,inline,paragraph_close, blockquote_close
          continue;
        }
      }

      // Code Blocks (``` or ```js)

      if (token.type === "code_block" || token.type === "fence") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: token.content ?? "",
                font: "Courier New",
                size: 20,
                color: "333333",
              }),
            ],
            spacing: { before: 200, after: 200 },
            shading: {
              fill: "f5f5f5",
            },
          })
        );
        continue;
      }

      // Horizontal Rule (---)
      if (token.type === "hr") {
        paragraphs.push(
          new Paragraph({
            text: "",
            border: {
              bottom: {
                color: "cccccc",
                space: 1,
                size: 6,
                style: "single",
              },
            },
            spacing: { before: 200, after: 200 },
          })
        );
      }
    } catch (error) {
      // Log any errors encountered during processing
      logger.error("Error processing markdown token for DOCX export", {
        label: "ExportService",
        error,
      });

      // Throw an APIError to indicate failure in processing markdown content
      throw new APIError(500, "Error processing markdown content", {
        type: "ContentProcessingError",
        details: [
          {
            field: "markdown",
            message: "Failed to process markdown content",
          },
        ],
      });
    }
  }

  // Return the array of Paragraph objects representing the processed markdown content
  return paragraphs;
};

// ------------------------------------------------------
// renderInlineTokens() — Renders inline markdown tokens into a PDF document
// ------------------------------------------------------
export const renderInlineTokens = (
  doc: PDFKit.PDFDocument,
  tokens: Token[],
  options: InlineRenderOptions = {}
) => {
  // Return early if there are no tokens to render
  if (!tokens || tokens.length === 0) return;

  // Set default rendering options
  const baseOptions = {
    align: options.align || "justify",
    indent: options.indent || 0,
    lineGap: options.lineGap || 2,
  };

  let currentFont = TYPOGRAPHY.fonts.serif; // Default font
  let textBuffer = "";

  // Function to flush the text buffer to the PDF document
  const flushBuffer = () => {
    if (textBuffer) {
      doc.font(currentFont).text(textBuffer, {
        ...baseOptions,
      });
      textBuffer = "";
    }
  };

  // Process each token and render accordingly
  for (let i = 0; i < tokens.length; i++) {
    // Get the current token
    const token = tokens[i];

    // Handle different token types for inline formatting
    switch (token.type) {
      case "text":
        textBuffer += token.content;
        break;

      case "strong_open":
        flushBuffer();
        currentFont = TYPOGRAPHY.fonts.serifBold;
        break;

      case "strong_close":
        flushBuffer();
        currentFont = TYPOGRAPHY.fonts.serif;
        break;

      case "em_open":
        flushBuffer();
        currentFont = TYPOGRAPHY.fonts.serifItalic;
        break;

      case "em_close":
        flushBuffer();
        currentFont = TYPOGRAPHY.fonts.serif;
        break;

      case "code_inline":
        flushBuffer();
        doc.font("Courier").text(token.content, {
          ...baseOptions,
          continued: true,
        });
        doc.font(currentFont);
        break;
    }
  }

  if (textBuffer) {
    doc.font(currentFont).text(textBuffer, {
      ...baseOptions,
      continued: false,
    });
  } else {
    doc.text("", { continued: false });
  }
};

// ------------------------------------------------------
// renderMarkdown() — Renders markdown content into a PDF document
// ------------------------------------------------------
export const renderMarkdown = ({
  doc,
  markdown,
  md,
}: RenderMarkdownOptions) => {
  // Return early if there's no markdown content
  if (!markdown || markdown.trim() === "") return;

  // Parse the markdown content into tokens
  const tokens: Token[] = md.parse(markdown, {});
  let inList = false; // Flag to track if we are inside a list
  let listType: "bullet" | "ordered" | null = null; // Type of the current list
  let orderedListCounter = 1; // Counter for ordered lists

  // Process each token in the markdown
  for (let i = 0; i < tokens.length; i++) {
    // Get the current token
    const token = tokens[i];

    // Handle different token types
    try {
      // Headings
      if (token.type === "heading_open") {
        const level = parseInt(token.tag.replace("h", ""), 10);

        const fontSize =
          level === 1
            ? TYPOGRAPHY.sizes.h1
            : level === 2
            ? TYPOGRAPHY.sizes.h2
            : TYPOGRAPHY.sizes.h3;

        doc.moveDown(
          TYPOGRAPHY.spacing.headingSpacing.before / TYPOGRAPHY.sizes.body
        );

        doc
          .font(TYPOGRAPHY.fonts.sansBold)
          .fontSize(fontSize)
          .fillColor(TYPOGRAPHY.colors.heading);

        if (tokens[i + 1] && tokens[i + 1].type === "inline") {
          renderInlineTokens(doc, tokens[i + 1].children || [], {
            align: "left",
            lineGap: 0,
          });
          i++;
        }

        doc.moveDown(
          TYPOGRAPHY.spacing.headingSpacing.after / TYPOGRAPHY.sizes.body
        );

        if (tokens[i + 1] && tokens[i + 1].type === "heading_close") {
          i++;
        }

        continue;
      }

      // Paragraphs
      if (token.type === "paragraph_open") {
        doc
          .font(TYPOGRAPHY.fonts.serif)
          .fontSize(TYPOGRAPHY.sizes.body)
          .fillColor(TYPOGRAPHY.colors.text);

        if (tokens[i + 1] && tokens[i + 1].type === "inline") {
          renderInlineTokens(doc, tokens[i + 1].children || [], {
            align: "justify",
            lineGap:
              TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body,
          });
          i++;
        }

        if (!inList) {
          doc.moveDown(
            TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body
          );
        }

        if (tokens[i + 1] && tokens[i + 1].type === "paragraph_close") {
          i++;
        }

        continue;
      }

      // Bullet Lists
      if (token.type === "bullet_list_open") {
        inList = true;
        listType = "bullet";
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
        continue;
      }

      if (token.type === "bullet_list_close") {
        inList = false;
        listType = null;

        //Add spacing after list
        doc.moveDown(
          TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body
        );

        continue;
      }

      // Ordered Lists
      if (token.type === "ordered_list_open") {
        inList = true;
        listType = "ordered";
        orderedListCounter = 1;
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
        continue;
      }

      if (token.type === "ordered_list_close") {
        inList = false;
        listType = null;

        //Add spacing after list
        doc.moveDown(
          TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body
        );
        continue;
      }

      // List Items
      if (token.type === "list_item_open") {
        let bullet = "";

        if (listType === "bullet") {
          bullet = "• ";
        } else if (listType === "ordered") {
          bullet = `${orderedListCounter}. `;
          orderedListCounter++;
        }

        doc
          .font(TYPOGRAPHY.fonts.serif)
          .fontSize(TYPOGRAPHY.sizes.body)
          .fillColor(TYPOGRAPHY.colors.text);

        doc.text(bullet, { indent: 20, continued: true });

        for (let j = i + 1; j < tokens.length; j++) {
          if (tokens[j].type === "inline" && tokens[j].children) {
            renderInlineTokens(doc, tokens[j].children || [], {
              align: "left",
              lineGap: 2,
            });
            break;
          } else if (tokens[j].type === "list_item_close") {
            break;
          }
        }

        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
        continue;
      }

      //  Blockquotes
      if (token.type === "code_block" || token.type === "fence") {
        doc.moveDown(
          TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body
        );

        doc
          .font("Courier")
          .fontSize(9)
          .fillColor(TYPOGRAPHY.colors.text)
          .text(token.content, {
            align: "left",
            indent: 20,
          });

        doc.font(TYPOGRAPHY.fonts.serif).fontSize(TYPOGRAPHY.sizes.body);

        doc.moveDown(
          TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body
        );

        continue;
      }

      if (token.type === "hr") {
        doc.moveDown();
        const y = doc.y;

        doc
          .moveTo(doc.page.margins.left, y)
          .lineTo(doc.page.width - doc.page.margins.right, y)
          .stroke();

        doc.moveDown();
        continue;
      }
    } catch (error) {
      logger.error("Error rendering markdown to PDF", {
        label: "PDFExportService",
        error,
      });

      throw new APIError(500, "Error rendering markdown to PDF", {
        type: "PDFRenderingError",
        details: [
          {
            field: "markdown",
            message: "Failed to render markdown content to PDF",
          },
        ],
      });
    }
  }
};
