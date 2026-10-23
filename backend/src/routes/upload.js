import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { requireAdmin } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

// Ensure uploads folder exists on startup
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Supported MIME types and their safe file extensions
const MIME_EXT_MAP = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/**
 * POST /api/upload - Upload product image directly from device
 * Accepts JSON payload: { image: "data:image/png;base64,...", fileName: "jacket.png" }
 * Saves to backend/uploads/ and returns public URL "/uploads/prod-... .ext"
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { image, fileName } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "No image data provided. Please select or upload a valid image file.",
      });
    }

    let buffer;
    let extension = "jpg";

    // Match data URL: data:image/png;base64,iVBORw...
    const dataUrlMatch = image.match(/^data:([a-zA-Z0-9\/\+]+);base64,(.+)$/);

    if (dataUrlMatch) {
      const mimeType = dataUrlMatch[1].toLowerCase();
      const base64Data = dataUrlMatch[2];

      if (!MIME_EXT_MAP[mimeType]) {
        return res.status(400).json({
          success: false,
          message: `Unsupported image format (${mimeType}). Please upload a JPEG, PNG, WEBP, GIF, or SVG image.`,
        });
      }

      extension = MIME_EXT_MAP[mimeType];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      // If raw base64 without prefix, attempt to detect extension from fileName
      if (fileName && typeof fileName === "string") {
        const ext = fileName.split(".").pop().toLowerCase();
        if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
          extension = ext === "jpeg" ? "jpg" : ext;
        }
      }
      buffer = Buffer.from(image, "base64");
    }

    // Check file size (max 15MB)
    const MAX_SIZE_BYTES = 15 * 1024 * 1024;
    if (buffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `Image size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed limit of 15MB.`,
      });
    }

    if (buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image buffer is empty. Please select a valid image file.",
      });
    }

    // Generate safe unique filename
    const uniqueId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const generatedFileName = `prod-${uniqueId}.${extension}`;
    const targetFilePath = path.join(uploadsDir, generatedFileName);

    await fs.promises.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${generatedFileName}`;

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully!",
      url: publicUrl,
      fileName: generatedFileName,
      sizeBytes: buffer.length,
      mimeType: `image/${extension}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to save uploaded image: ${error.message}`,
    });
  }
});

export default router;
