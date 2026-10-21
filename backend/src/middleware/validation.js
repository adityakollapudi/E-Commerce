/**
 * Centralized Input Validation & Sanitization Middleware
 * Defends against malformed payloads, injection, prototype pollution,
 * excessive string lengths, and internal field tampering.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate positive integer ID in request parameters (e.g. /:id)
export const validateIdParam = (paramName = "id") => {
  return (req, res, next) => {
    const rawValue = req.params[paramName];
    if (typeof rawValue !== "string" || !rawValue.trim()) {
      return res.status(400).json({
        success: false,
        message: `Missing required parameter '${paramName}'.`,
      });
    }

    const parsed = parseInt(rawValue, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== rawValue.trim()) {
      return res.status(400).json({
        success: false,
        message: `Invalid '${paramName}' parameter. Must be a positive integer.`,
      });
    }

    req.validatedId = parsed;
    next();
  };
};

// Validate and sanitize catalog query parameters (search, filter, sort, pagination)
export const validateCatalogQueryParams = (req, res, next) => {
  const { search, category, style, minPrice, maxPrice, sort, page, limit } = req.query;

  // 1. Sanitize search query (cap to 100 characters, remove control characters)
  if (search !== undefined) {
    if (typeof search !== "string") {
      req.query.search = "";
    } else {
      req.query.search = search.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 100);
    }
  }

  // 2. Validate price filters (must be finite, non-negative numbers)
  if (minPrice !== undefined) {
    const num = Number(minPrice);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'minPrice' parameter. Must be a non-negative number.",
      });
    }
    req.query.minPrice = num;
  }

  if (maxPrice !== undefined) {
    const num = Number(maxPrice);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'maxPrice' parameter. Must be a non-negative number.",
      });
    }
    req.query.maxPrice = num;
  }

  // 3. Validate pagination parameters
  if (page !== undefined) {
    const p = parseInt(page, 10);
    if (isNaN(p) || p <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'page' parameter. Must be a positive integer.",
      });
    }
    req.query.page = p;
  }

  if (limit !== undefined) {
    const l = parseInt(limit, 10);
    if (isNaN(l) || l <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid 'limit' parameter. Must be a positive integer.",
      });
    }
    // Cap limit to 100 to prevent denial of service through huge payloads
    req.query.limit = Math.min(l, 100);
  }

  // 4. Validate allowed sort options
  const ALLOWED_SORTS = ["most-popular", "price-low", "price-high", "rating", "newest"];
  if (sort && typeof sort === "string" && !ALLOWED_SORTS.includes(sort.trim())) {
    // If unknown sort provided, safely fall back to default rather than failing
    req.query.sort = "most-popular";
  }

  next();
};

// Validate product creation payload (POST /api/products)
export const validateProductCreatePayload = (req, res, next) => {
  const { title, price, originalPrice, category, style, description, moq } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Product title is required and must be a non-empty string.",
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: "Product title cannot exceed 200 characters.",
    });
  }

  const numPrice = Number(price);
  if (price === undefined || isNaN(numPrice) || !isFinite(numPrice) || numPrice <= 0 || numPrice > 1000000) {
    return res.status(400).json({
      success: false,
      message: "A valid positive price (up to ₹1,000,000) is required.",
    });
  }

  if (originalPrice !== undefined) {
    const numOrig = Number(originalPrice);
    if (isNaN(numOrig) || !isFinite(numOrig) || numOrig < 0 || numOrig > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Original price must be a valid positive number.",
      });
    }
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Category is required and must be a string.",
    });
  }

  if (category.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: "Category cannot exceed 50 characters.",
    });
  }

  if (style && (typeof style !== "string" || style.trim().length > 50)) {
    return res.status(400).json({
      success: false,
      message: "Style cannot exceed 50 characters.",
    });
  }

  if (description && (typeof description !== "string" || description.length > 2000)) {
    return res.status(400).json({
      success: false,
      message: "Description cannot exceed 2,000 characters.",
    });
  }

  if (moq !== undefined) {
    const numMoq = Number(moq);
    if (!Number.isInteger(numMoq) || numMoq <= 0 || numMoq > 50000) {
      return res.status(400).json({
        success: false,
        message: "MOQ must be a positive integer up to 50,000.",
      });
    }
  }

  next();
};

// Validate and whitelist product update payload (PUT /api/products/:id)
// Strictly prevents tampering with protected fields: id, createdAt, createdBy
export const validateProductUpdatePayload = (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Update payload must be a valid JSON object.",
    });
  }

  const ALLOWED_UPDATE_FIELDS = [
    "title",
    "price",
    "originalPrice",
    "category",
    "style",
    "brand",
    "sku",
    "description",
    "features",
    "specs",
    "sizes",
    "colors",
    "image",
    "images",
    "moq",
    "deliveryDays",
    "unitLabel",
    "priceNote",
    "isNew",
    "isBestSeller",
  ];

  // Disallow updates to protected internal properties
  const PROTECTED_FIELDS = ["id", "createdAt", "createdBy", "_id"];
  for (const field of PROTECTED_FIELDS) {
    if (field in req.body) {
      delete req.body[field];
    }
  }

  // Validate fields if provided in update
  if (req.body.title !== undefined) {
    if (typeof req.body.title !== "string" || !req.body.title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title must be a non-empty string.",
      });
    }
    if (req.body.title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters.",
      });
    }
  }

  if (req.body.price !== undefined) {
    const numPrice = Number(req.body.price);
    if (isNaN(numPrice) || !isFinite(numPrice) || numPrice <= 0 || numPrice > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive finite number up to ₹1,000,000.",
      });
    }
  }

  if (req.body.originalPrice !== undefined) {
    const numOrig = Number(req.body.originalPrice);
    if (isNaN(numOrig) || !isFinite(numOrig) || numOrig <= 0 || numOrig > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Original price must be a positive finite number.",
      });
    }
  }

  if (req.body.category !== undefined) {
    if (typeof req.body.category !== "string" || !req.body.category.trim() || req.body.category.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Category must be a non-empty string up to 50 characters.",
      });
    }
  }

  // Sanitize to only allowed fields
  const sanitized = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in req.body) {
      sanitized[key] = req.body[key];
    }
  }

  req.sanitizedUpdates = sanitized;
  next();
};

// Validate corporate quote payload (POST /api/quote)
export const validateQuotePayload = (req, res, next) => {
  const { contactEmail, contactPhone, companyName, quantity, notes } = req.body || {};

  if (!contactEmail || typeof contactEmail !== "string" || !EMAIL_REGEX.test(contactEmail.trim())) {
    return res.status(400).json({
      success: false,
      message: "A valid contact email address is required.",
    });
  }

  if (contactPhone && (typeof contactPhone !== "string" || contactPhone.trim().length > 30)) {
    return res.status(400).json({
      success: false,
      message: "Contact phone cannot exceed 30 characters.",
    });
  }

  if (companyName && (typeof companyName !== "string" || companyName.trim().length > 100)) {
    return res.status(400).json({
      success: false,
      message: "Company name cannot exceed 100 characters.",
    });
  }

  if (quantity !== undefined) {
    const q = Number(quantity);
    if (!Number.isInteger(q) || q <= 0 || q > 100000) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer between 1 and 100,000.",
      });
    }
  }

  if (notes && (typeof notes !== "string" || notes.length > 1000)) {
    return res.status(400).json({
      success: false,
      message: "Notes cannot exceed 1,000 characters.",
    });
  }

  next();
};
