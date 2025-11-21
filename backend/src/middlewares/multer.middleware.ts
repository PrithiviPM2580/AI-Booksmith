// ============================================================
// 🧩 MulterMiddleware — Handles file upload middleware
// ============================================================
import multer from "multer";
import logger from "@/lib/logger.lib.js";
import APIError from "@/lib/api-error.lib.js";

// ------------------------------------------------------
//  Multer Memory Storage (best for Cloud uploads)
// ------------------------------------------------------
const storage = multer.memoryStorage(); // Store files in memory as Buffer objects

// ------------------------------------------------------
// File Filter: allow only images
// ------------------------------------------------------
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Define allowed MIME types for image files
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Check if the uploaded file's MIME type is in the allowed list
  if (!allowedMimeTypes.includes(file.mimetype)) {
    // Log a warning for invalid file type
    logger.warn("Invalid file type uploaded", {
      label: "MulterMiddleware",
      fileType: file.mimetype,
    });

    // Return an error for invalid file type
    return cb(
      new APIError(400, "Invalid file type. Only image files are allowed.", {
        type: "InvalidFileType",
        details: [
          {
            field: "file",
            message: `Uploaded file type ${file.mimetype} is not allowed.`,
          },
        ],
      })
    );
  }

  // Accept the file if it passes the MIME type check
  cb(null, true);
};

// ---------------------------------------------
// Create Multer Upload Instance
// ---------------------------------------------
const upload = multer({
  storage, // Use memory storage
  fileFilter, // Apply file filter
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

// ---------------------------------------------
// Export helpers for reuse
// ---------------------------------------------
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

export const uploadArray = (fieldName: string, maxCount: number) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (fields: { name: string; maxCount: number }[]) =>
  upload.fields(fields);

export default upload;
