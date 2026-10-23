import express from "express";
import { PRODUCTS } from "../data/products.js";
import { requireAdmin } from "../middleware/auth.js";
import {
  validateIdParam,
  validateCatalogQueryParams,
  validateProductCreatePayload,
  validateProductUpdatePayload,
  validateBulkImportPayload,
} from "../middleware/validation.js";
import {
  loadInitialCatalog,
  saveCatalogToDisk,
  createBackupSnapshot,
  updateSnapshotPostImport,
  rollbackToSnapshot,
  isRollbackAllowed,
  RollbackEligibilityError,
  getImportHistory,
  isImportInProgress,
  acquireMutationLock,
  releaseMutationLock,
  advanceCatalogRevision,
  getCatalogRevision,
  setImportLock,
  resetStoreForTesting,
} from "../data/catalogStore.js";
import { Product } from "../models/Product.js";
import { isMongoConnected } from "../db.js";

export const STANDARDIZED_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Free Size",
];

export const normalizeSize = (size) => {
  if (!size || typeof size !== "string") return "";
  const s = size.trim().toLowerCase();
  switch (s) {
    case "xs":
    case "x-small":
    case "xsmall":
    case "extra small":
      return "XS";
    case "s":
    case "small":
      return "S";
    case "m":
    case "medium":
      return "M";
    case "l":
    case "large":
      return "L";
    case "xl":
    case "x-large":
    case "xlarge":
    case "extra large":
      return "XL";
    case "xxl":
    case "2xl":
    case "xx-large":
    case "xxlarge":
      return "XXL";
    case "free size":
    case "freesize":
    case "free":
    case "one size":
    case "onesize":
      return "Free Size";
    default:
      return size.trim();
  }
};

const safeDecode = (str) => {
  if (typeof str !== "string") return "";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

// Strips internal creator/editor emails before public output to prevent information disclosure
const sanitizeProductForPublic = (p) => {
  if (!p) return null;
  const copy = { ...p };
  delete copy.createdBy;
  delete copy.updatedBy;
  return copy;
};

const router = express.Router();

// Dynamic in-memory products catalog initialized from persistent store or seed data
let productsCatalog = loadInitialCatalog();

export const findCatalogProductById = (id) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  return productsCatalog.find((p) => p.id === numericId) || null;
};

export const getLiveProductsCatalog = () => productsCatalog;

export const resetCatalogForTesting = (seed = PRODUCTS) => {
  productsCatalog = resetStoreForTesting(seed);
  return productsCatalog;
};

// GET all products with filtering, search, sorting, and pagination
router.get("/", validateCatalogQueryParams, (req, res) => {
  try {
    const {
      category,
      subcategory,
      style,
      search,
      sort,
      minPrice,
      maxPrice,
      size,
      page = 1,
      limit = 50,
    } = req.query;

    let result = [...productsCatalog];

    // Search filter (capped to 100 chars, sanitized against control chars)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.style?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== "all") {
      const cat = safeDecode(category).toLowerCase();
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === cat ||
          p.style?.toLowerCase() === cat ||
          (cat === "bottles" && (p.category?.toLowerCase().includes("bottle") || p.title?.toLowerCase().includes("bottle"))) ||
          (cat === "mugs" && (p.category?.toLowerCase().includes("mug") || p.title?.toLowerCase().includes("mug"))) ||
          (cat === "key chains" && (p.category?.toLowerCase().includes("key") || p.title?.toLowerCase().includes("key")))
      );
    }

    // Subcategory filter (e.g. Aluminium, Stainless Steel, etc.)
    if (subcategory && subcategory !== "all") {
      const sub = safeDecode(subcategory).toLowerCase();
      result = result.filter(
        (p) =>
          p.subcategory?.toLowerCase() === sub ||
          p.subcategory?.toLowerCase().includes(sub) ||
          p.title?.toLowerCase().includes(sub) ||
          p.description?.toLowerCase().includes(sub)
      );
    }

    // Dress Style filter
    if (style && style !== "all") {
      const s = safeDecode(style).toLowerCase();
      result = result.filter((p) => p.style?.toLowerCase() === s);
    }

    // Price range filter
    if (minPrice !== undefined) {
      result = result.filter((p) => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice !== undefined) {
      result = result.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    // Size filter with normalized matching
    if (size) {
      const rawSizes = Array.isArray(size) ? size : [size];
      const normalizedQuerySizes = rawSizes.map(normalizeSize);
      result = result.filter((p) =>
        p.sizes &&
        p.sizes.some((s) => normalizedQuerySizes.includes(normalizeSize(s)))
      );
    }

    // Sorting
    if (sort === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "rating") {
      result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    } else if (sort === "newest") {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    // Pagination (clamped to safe limits)
    const totalCount = result.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = result
      .slice(startIndex, startIndex + limitNum)
      .map(sanitizeProductForPublic);

    res.json({
      success: true,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      products: paginatedItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred while fetching products." });
  }
});

// GET New Arrivals
router.get("/featured/new-arrivals", (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
  const newArrivals = productsCatalog
    .filter((p) => p.isNew)
    .slice(0, limit)
    .map(sanitizeProductForPublic);
  res.json({ success: true, count: newArrivals.length, products: newArrivals });
});

// GET Best Sellers
router.get("/featured/best-sellers", (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 4));
  const bestSellers = productsCatalog
    .filter((p) => p.isBestSeller)
    .slice(0, limit)
    .map(sanitizeProductForPublic);
  res.json({ success: true, count: bestSellers.length, products: bestSellers });
});

// GET Categories metadata
router.get("/meta/categories", (req, res) => {
  const uniqueCategories = [
    ...new Set(productsCatalog.map((p) => p.category?.toLowerCase()).filter(Boolean)),
  ];

  const categories = [
    { id: "all", name: "All Products", count: productsCatalog.length },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      name: cat
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count: productsCatalog.filter((p) => p.category?.toLowerCase() === cat).length,
    })),
  ];

  res.json({ success: true, categories });
});

// GET Styles metadata
router.get("/meta/styles", (req, res) => {
  const styleDefaults = [
    { id: "corporate", name: "Corporate Gifting", img: "/casual.jpg" },
    { id: "casual", name: "Casual", img: "/casual.jpg" },
    { id: "formal", name: "Formal", img: "/formal.jpg" },
    { id: "party", name: "Party", img: "/party.jpg" },
    { id: "gym", name: "Gym", img: "/gym.jpg" },
  ];

  const styles = styleDefaults.map((s) => ({
    ...s,
    count: productsCatalog.filter((p) => p.style?.toLowerCase() === s.id).length,
  }));

  res.json({ success: true, styles });
});

// GET single product by ID (Validates positive integer parameter)
router.get("/:id", validateIdParam("id"), (req, res) => {
  const id = req.validatedId;
  const product = productsCatalog.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Related products
  const related = productsCatalog
    .filter(
      (p) => p.id !== id && (p.category === product.category || p.style === product.style)
    )
    .slice(0, 4)
    .map(sanitizeProductForPublic);

  res.json({
    success: true,
    product: sanitizeProductForPublic(product),
    related,
  });
});

// POST /api/products - Create New Product (Admin Only + Validated)
router.post("/", requireAdmin, validateProductCreatePayload, async (req, res) => {
  const lock = acquireMutationLock("crud");
  if (!lock.acquired) {
    return res.status(409).json({
      success: false,
      message: lock.reason,
    });
  }

  try {
    const {
      title,
      price,
      originalPrice,
      category,
      subcategory,
      style,
      brand,
      sku,
      description,
      features,
      specs,
      sizes,
      colors,
      image,
      images,
      moq,
      deliveryDays,
      isNew = true,
      isBestSeller = false,
    } = req.body;

    const numericPrice = Number(price);
    const numericOriginalPrice = originalPrice !== undefined ? Number(originalPrice) : numericPrice;
    const discount =
      numericOriginalPrice > numericPrice
        ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
        : 0;

    const newId = Date.now();
    const primaryImg =
      (typeof image === "string" && image.trim()) ||
      (typeof img === "string" && img.trim()) ||
      (Array.isArray(images) && images.length > 0 && typeof images[0] === "string" ? images[0] : null) ||
      "/introImageCompressed.jfif";

    const allImages =
      Array.isArray(images) && images.length > 0
        ? images.filter((imgItem) => typeof imgItem === "string" && imgItem.trim())
        : [primaryImg];

    // Normalize features into array
    let parsedFeatures = [];
    if (Array.isArray(features)) {
      parsedFeatures = features.filter((f) => typeof f === "string" && f.trim());
    } else if (typeof features === "string") {
      parsedFeatures = features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
    }
    if (parsedFeatures.length === 0) {
      parsedFeatures = [
        "Premium quality material and craftsmanship",
        "Durable, long-lasting construction",
        "Official warranty and hassle-free returns",
      ];
    }

    const cleanCategory = category.trim();
    const cleanSubcategory = typeof subcategory === "string" && subcategory.trim() ? subcategory.trim().slice(0, 100) : "";

    const newProduct = {
      id: newId,
      sku: typeof sku === "string" && sku.trim() ? sku.trim().slice(0, 50) : `PRD-${newId.toString().slice(-6)}`,
      brand: typeof brand === "string" && brand.trim() ? brand.trim().slice(0, 50) : "SHOP.CO",
      title: title.trim().slice(0, 200),
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      discountPercent: discount,
      category: cleanCategory,
      subcategory: cleanSubcategory,
      style: typeof style === "string" && style.trim() ? style.trim().toLowerCase().slice(0, 50) : "corporate",
      rating: { rate: 5.0, count: 1 },
      isNew: Boolean(isNew),
      isBestSeller: Boolean(isBestSeller),
      moq: Number(moq) || 1,
      deliveryDays: typeof deliveryDays === "string" && deliveryDays.trim() ? deliveryDays.trim().slice(0, 50) : "3–5 Days",
      unitLabel: "piece",
      priceNote: "Standard retail price",
      description:
        typeof description === "string" && description.trim()
          ? description.trim().slice(0, 2000)
          : `${title.trim()} crafted with premium attention to detail. Perfect addition to your collection.`,
      features: parsedFeatures,
      specs: specs || {
        Brand: typeof brand === "string" && brand.trim() ? brand.trim().slice(0, 50) : "SHOP.CO",
        Category: cleanCategory,
        Subcategory: cleanSubcategory || "Standard",
        Style: style || "Corporate",
        Warranty: "1 Year Official Guarantee",
      },
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes.map(normalizeSize) : ["S", "M", "L", "XL"],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : ["#000000", "#4F46E5"],
      image: primaryImg,
      img: primaryImg,
      images: allImages,
      createdAt: new Date().toISOString(),
      createdBy: req.user.email,
    };

    // Safe commit: persist candidate catalog to disk BEFORE updating in-memory pointer
    const candidateCatalog = [newProduct, ...productsCatalog];
    saveCatalogToDisk(candidateCatalog);
    advanceCatalogRevision("create_product");
    productsCatalog = candidateCatalog;

    // Real-time synchronization to MongoDB Atlas
    if (isMongoConnected()) {
      try {
        await Product.findOneAndUpdate(
          { id: String(newProduct.id) },
          { ...newProduct, id: String(newProduct.id) },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`🍃 [MongoDB] Synced newly added product #${newProduct.id} ("${newProduct.title}") to Atlas.`);
      } catch (dbErr) {
        console.warn("[MongoDB Sync Error on Create]:", dbErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully to catalog!",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to create product: ${error.message}` });
  } finally {
    releaseMutationLock();
  }
});

// PUT /api/products/:id - Edit Existing Product (Admin Only + ID/Payload Validated)
router.put(
  "/:id",
  requireAdmin,
  validateIdParam("id"),
  validateProductUpdatePayload,
  async (req, res) => {
    const lock = acquireMutationLock("crud");
    if (!lock.acquired) {
      return res.status(409).json({
        success: false,
        message: lock.reason,
      });
    }

    try {
      const id = req.validatedId;
      const index = productsCatalog.findIndex((p) => p.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }

      const existing = productsCatalog[index];
      const updates = req.sanitizedUpdates;

      const numericPrice = updates.price !== undefined ? Number(updates.price) : existing.price;
      const numericOriginal =
        updates.originalPrice !== undefined ? Number(updates.originalPrice) : existing.originalPrice;
      const discount =
        numericOriginal > numericPrice
          ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
          : 0;

      const updatedImg =
        (typeof updates.image === "string" && updates.image.trim()) ||
        (typeof updates.img === "string" && updates.img.trim()) ||
        (Array.isArray(updates.images) && updates.images.length > 0 && typeof updates.images[0] === "string" ? updates.images[0] : null) ||
        existing.image ||
        existing.img ||
        (Array.isArray(existing.images) && existing.images[0]) ||
        "/introImageCompressed.jfif";

      const updatedImages =
        Array.isArray(updates.images) && updates.images.length > 0
          ? updates.images
          : [updatedImg];

      // Protected fields (id, createdAt, createdBy) are strictly immutable
      const updatedProduct = {
        ...existing,
        ...updates,
        id,                             // Immutable ID
        createdAt: existing.createdAt, // Immutable createdAt
        createdBy: existing.createdBy, // Immutable createdBy
        price: numericPrice,
        originalPrice: numericOriginal,
        discountPercent: discount,
        image: updatedImg,
        img: updatedImg,
        images: updatedImages,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.email,
      };

      // Safe commit: persist candidate catalog to disk BEFORE updating in-memory pointer
      const candidateCatalog = [...productsCatalog];
      candidateCatalog[index] = updatedProduct;
      saveCatalogToDisk(candidateCatalog);
      advanceCatalogRevision("update_product");
      productsCatalog = candidateCatalog;

      // Real-time synchronization to MongoDB Atlas
      if (isMongoConnected()) {
        try {
          await Product.findOneAndUpdate(
            { id: String(id) },
            { ...updatedProduct, id: String(id) },
            { upsert: true, new: true }
          );
          console.log(`🍃 [MongoDB] Synced updated product #${id} ("${updatedProduct.title}") to Atlas.`);
        } catch (dbErr) {
          console.warn("[MongoDB Sync Error on Update]:", dbErr.message);
        }
      }

      res.json({
        success: true,
        message: "Product updated successfully!",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: `Failed to update product: ${error.message}` });
    } finally {
      releaseMutationLock();
    }
  }
);

// DELETE /api/products/:id - Delete Product (Admin Only + ID Validated)
router.delete("/:id", requireAdmin, validateIdParam("id"), async (req, res) => {
  const lock = acquireMutationLock("crud");
  if (!lock.acquired) {
    return res.status(409).json({
      success: false,
      message: lock.reason,
    });
  }

  try {
    const id = req.validatedId;
    const initialLen = productsCatalog.length;
    const candidateCatalog = productsCatalog.filter((p) => p.id !== id);

    if (candidateCatalog.length === initialLen) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Safe commit: persist candidate catalog to disk BEFORE updating in-memory pointer
    saveCatalogToDisk(candidateCatalog);
    advanceCatalogRevision("delete_product");
    productsCatalog = candidateCatalog;

    // Real-time synchronization to MongoDB Atlas
    if (isMongoConnected()) {
      try {
        await Product.deleteOne({ id: String(id) });
        console.log(`🍃 [MongoDB] Deleted product #${id} from Atlas.`);
      } catch (dbErr) {
        console.warn("[MongoDB Sync Error on Delete]:", dbErr.message);
      }
    }

    res.json({
      success: true,
      message: `Product #${id} was deleted successfully from the catalog.`,
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to delete product: ${error.message}` });
  } finally {
    releaseMutationLock();
  }
});

// POST /api/products/bulk-import - Bulk Product Catalogue Import (Admin Only + Batch Validated)
router.post(
  "/bulk-import",
  requireAdmin,
  validateBulkImportPayload,
  async (req, res) => {
    const items = req.bulkImportData.products;
    const { duplicateStrategy, dryRun } = req.bulkImportData;

    const conflicts = [];
    const rowsToProcess = [];

    // Detect duplicate SKUs and IDs against existing catalogue
    for (const item of items) {
      let matchedExisting = null;
      let matchReason = null;

      // 1. Match by SKU if provided
      if (item.sku) {
        const normSku = String(item.sku).trim().toLowerCase();
        matchedExisting = productsCatalog.find(
          (p) => p.sku && String(p.sku).trim().toLowerCase() === normSku
        );
        if (matchedExisting) {
          matchReason = `SKU '${item.sku}' matches existing product #${matchedExisting.id} ("${matchedExisting.title}") (already exists in catalogue)`;
        }
      }

      // 2. Match by ID if provided and not already matched
      if (!matchedExisting && item.id) {
        const numId = Number(item.id);
        matchedExisting = productsCatalog.find((p) => p.id === numId);
        if (matchedExisting) {
          matchReason = `ID '${item.id}' matches existing product #${matchedExisting.id} ("${matchedExisting.title}") (already exists in catalogue)`;
        }
      }

      if (matchedExisting) {
        if (duplicateStrategy === "error") {
          conflicts.push({
            row: item.rowNum,
            sku: item.sku || matchedExisting.sku,
            id: item.id || matchedExisting.id,
            conflictWith: {
              id: matchedExisting.id,
              sku: matchedExisting.sku,
              title: matchedExisting.title,
            },
            message: matchReason,
          });
        } else if (duplicateStrategy === "skip") {
          rowsToProcess.push({
            action: "skip",
            item,
            reason: matchReason,
          });
        } else if (duplicateStrategy === "update") {
          rowsToProcess.push({
            action: "update",
            item,
            existingProduct: matchedExisting,
          });
        }
      } else {
        rowsToProcess.push({
          action: "add",
          item,
        });
      }
    }

    // In error mode, any duplicate against existing catalog halts import immediately
    if (duplicateStrategy === "error" && conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Catalogue import rejected: ${conflicts.length} conflict(s) detected with existing catalogue.`,
        conflictCount: conflicts.length,
        conflicts,
        errors: conflicts,
      });
    }

    const toAdd = rowsToProcess.filter((r) => r.action === "add");
    const toUpdate = rowsToProcess.filter((r) => r.action === "update");
    const toSkip = rowsToProcess.filter((r) => r.action === "skip");

    // DRY-RUN MODE: Do not mutate in-memory or disk state
    if (dryRun) {
      return res.status(200).json({
        success: true,
        dryRun: true,
        message: "Dry-run validation successful. No changes made to catalogue.",
        totalReceived: items.length,
        duplicateStrategy,
        summary: {
          total: items.length,
          totalReceived: items.length,
          added: toAdd.length,
          wouldAdd: toAdd.length,
          updated: toUpdate.length,
          wouldUpdate: toUpdate.length,
          skipped: toSkip.length,
          wouldSkip: toSkip.length,
        },
        preview: [
          ...toAdd.map((r, idx) => ({
            action: "add",
            id: r.item.id || `auto_${idx + 1}`,
            sku: r.item.sku || `(auto_${idx + 1})`,
            title: r.item.title,
            price: Number(r.item.price),
            category: r.item.category,
          })),
          ...toUpdate.map((r) => ({
            action: "update",
            id: r.existingProduct.id,
            sku: r.item.sku || r.existingProduct.sku,
            title: r.item.title,
            price: Number(r.item.price),
          })),
          ...toSkip.map((r) => ({
            action: "skip",
            id: r.item.id,
            sku: r.item.sku,
            title: r.item.title,
            reason: r.reason,
          })),
        ],
        details: {
          additions: toAdd.slice(0, 10).map((r) => ({
            row: r.item.rowNum,
            sku: r.item.sku || "(auto-generate)",
            title: r.item.title,
            price: Number(r.item.price),
            category: r.item.category,
          })),
          updates: toUpdate.slice(0, 10).map((r) => ({
            row: r.item.rowNum,
            sku: r.item.sku || r.existingProduct.sku,
            title: r.item.title,
            existingId: r.existingProduct.id,
            currentPrice: r.existingProduct.price,
            newPrice: Number(r.item.price),
          })),
          skips: toSkip.slice(0, 10).map((r) => ({
            row: r.item.rowNum,
            sku: r.item.sku,
            title: r.item.title,
            reason: r.reason,
          })),
        },
      });
    }

    // COMMIT MODE: Protect against concurrent mutations with mutation lock
    const lock = acquireMutationLock("import");
    if (!lock.acquired) {
      return res.status(409).json({
        success: false,
        message: lock.reason,
      });
    }

    const importId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 1. Create pre-import snapshot
    createBackupSnapshot(importId, req.user.email, productsCatalog);

    try {
      const updatedCatalog = [...productsCatalog];
      let maxId = updatedCatalog.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
      if (maxId < 1000) maxId = 1000;

      // Process updates
      for (const r of toUpdate) {
        const idx = updatedCatalog.findIndex((p) => p.id === r.existingProduct.id);
        if (idx !== -1) {
          const existing = updatedCatalog[idx];
          const numPrice = Number(r.item.price);
          const numOrig =
            r.item.originalPrice !== undefined
              ? Number(r.item.originalPrice)
              : existing.originalPrice || numPrice;
          const discount = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

          updatedCatalog[idx] = {
            ...existing,
            ...r.item,
            id: existing.id,             // strictly immutable
            createdAt: existing.createdAt, // strictly immutable
            createdBy: existing.createdBy, // strictly immutable
            price: numPrice,
            originalPrice: numOrig,
            discountPercent: discount,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user.email,
          };
          delete updatedCatalog[idx].rowNum;
        }
      }

      const addedProducts = [];

      // Process additions
      for (const r of toAdd) {
        maxId += 1;
        const assignedId = r.item.id ? Number(r.item.id) : maxId;
        const assignedSku =
          r.item.sku && String(r.item.sku).trim()
            ? String(r.item.sku).trim()
            : `PRD-${assignedId.toString().slice(-6)}`;
        const numPrice = Number(r.item.price);
        const numOrig =
          r.item.originalPrice !== undefined ? Number(r.item.originalPrice) : numPrice;
        const discount = numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

        const newProd = {
          id: assignedId,
          sku: assignedSku,
          brand: r.item.brand ? String(r.item.brand).trim().slice(0, 50) : "SHOP.CO",
          title: String(r.item.title).trim().slice(0, 200),
          price: numPrice,
          originalPrice: numOrig,
          discountPercent: discount,
          category: String(r.item.category).trim().toLowerCase().slice(0, 50),
          style: r.item.style ? String(r.item.style).trim().toLowerCase().slice(0, 50) : "casual",
          rating:
            r.item.rating && typeof r.item.rating === "object"
              ? r.item.rating
              : { rate: 5.0, count: 1 },
          isNew: r.item.isNew !== undefined ? Boolean(r.item.isNew) : true,
          isBestSeller: r.item.isBestSeller !== undefined ? Boolean(r.item.isBestSeller) : false,
          moq: Number(r.item.moq) || 1,
          deliveryDays: r.item.deliveryDays
            ? String(r.item.deliveryDays).trim().slice(0, 50)
            : "3–5 Days",
          unitLabel: r.item.unitLabel ? String(r.item.unitLabel).trim() : "piece",
          priceNote: r.item.priceNote ? String(r.item.priceNote).trim() : "Standard retail price",
          description: r.item.description
            ? String(r.item.description).trim().slice(0, 2000)
            : `${r.item.title.trim()} crafted with premium attention to detail.`,
          features: Array.isArray(r.item.features)
            ? r.item.features
            : typeof r.item.features === "string"
            ? r.item.features.split("\n").map((f) => f.trim()).filter(Boolean)
            : [],
          specs:
            r.item.specs && typeof r.item.specs === "object"
              ? r.item.specs
              : {
                  Brand: r.item.brand || "SHOP.CO",
                  Category: r.item.category,
                  Style: r.item.style || "Casual",
                },
          sizes: Array.isArray(r.item.sizes) ? r.item.sizes.map(normalizeSize) : [],
          colors: Array.isArray(r.item.colors) ? r.item.colors : [],
          images: Array.isArray(r.item.images)
            ? r.item.images
            : r.item.image
            ? [r.item.image]
            : [],
          createdAt: new Date().toISOString(),
          createdBy: req.user.email,
        };
        delete newProd.rowNum;
        addedProducts.push(newProd);
        updatedCatalog.unshift(newProd);
      }

      // 2. Persist to disk atomically before in-memory commit
      saveCatalogToDisk(updatedCatalog);

      // 3. Advance revision and update snapshot's post-import revision
      const postRev = advanceCatalogRevision("bulk_import", importId);
      updateSnapshotPostImport(importId, postRev);

      // 4. Commit to in-memory state
      productsCatalog = updatedCatalog;

      // Real-time synchronization to MongoDB Atlas
      if (isMongoConnected() && (addedProducts.length > 0 || toUpdate.length > 0)) {
        try {
          const bulkOps = [
            ...addedProducts.map((p) => ({
              updateOne: {
                filter: { id: String(p.id) },
                update: { $set: { ...p, id: String(p.id) } },
                upsert: true,
              },
            })),
            ...toUpdate.map((r) => {
              const fullProd = updatedCatalog.find((p) => p.id === r.existingProduct.id);
              return {
                updateOne: {
                  filter: { id: String(r.existingProduct.id) },
                  update: { $set: { ...(fullProd || r.item), id: String(r.existingProduct.id) } },
                  upsert: true,
                },
              };
            }),
          ];
          if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps);
            console.log(`🍃 [MongoDB] Synced ${bulkOps.length} bulk imported products to Atlas.`);
          }
        } catch (dbErr) {
          console.warn("[MongoDB Bulk Import Sync Error]:", dbErr.message);
        }
      }

      res.status(201).json({
        success: true,
        message: "Bulk catalogue import committed successfully.",
        importId,
        summary: {
          total: items.length,
          totalReceived: items.length,
          added: toAdd.length,
          updated: toUpdate.length,
          skipped: toSkip.length,
        },
        preview: [
          ...addedProducts.map((p) => ({
            action: "add",
            id: p.id,
            sku: p.sku,
            title: p.title,
            price: p.price,
            category: p.category,
          })),
          ...toUpdate.map((r) => ({
            action: "update",
            id: r.existingProduct.id,
            sku: r.item.sku || r.existingProduct.sku,
            title: r.item.title,
            price: Number(r.item.price),
          })),
          ...toSkip.map((r) => ({
            action: "skip",
            id: r.item.id,
            sku: r.item.sku,
            title: r.item.title,
            reason: r.reason,
          })),
        ],
        persisted: true,
        catalogTotal: productsCatalog.length,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: `Failed to commit catalogue import: ${err.message}. Catalogue state preserved.`,
      });
    } finally {
      releaseMutationLock();
    }
  }
);

// POST /api/products/bulk-import/rollback - Rollback a Catalogue Import (Admin Only)
router.post("/bulk-import/rollback", requireAdmin, async (req, res) => {
  const { importId } = req.body || {};

  if (!importId || typeof importId !== "string" || !importId.trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid 'importId' is required for rollback.",
    });
  }

  const cleanImportId = importId.trim();

  const lock = acquireMutationLock("rollback");
  if (!lock.acquired) {
    return res.status(409).json({
      success: false,
      message: lock.reason,
    });
  }

  try {
    const check = isRollbackAllowed(cleanImportId);
    if (!check.allowed) {
      return res.status(400).json({
        success: false,
        message: check.reason,
      });
    }

    const restored = rollbackToSnapshot(cleanImportId);
    productsCatalog = restored;

    // Real-time synchronization of restored state to MongoDB Atlas
    if (isMongoConnected()) {
      try {
        await Product.deleteMany({});
        const docs = restored.map((p) => ({
          ...p,
          id: String(p.id),
        }));
        if (docs.length > 0) {
          await Product.insertMany(docs);
        }
        console.log(`🍃 [MongoDB] Restored ${docs.length} products to Atlas after rollback.`);
      } catch (dbErr) {
        console.warn("[MongoDB Rollback Sync Error]:", dbErr.message);
      }
    }

    res.json({
      success: true,
      message: `Import '${cleanImportId}' was successfully rolled back. Catalogue restored to pre-import snapshot.`,
      importId: cleanImportId,
      restoredProductCount: productsCatalog.length,
    });
  } catch (err) {
    console.error("[Rollback Route Error]:", err.message);
    if (
      err instanceof RollbackEligibilityError ||
      err.isEligibilityConflict ||
      err.name === "RollbackEligibilityError" ||
      err.message?.includes("Cannot rollback import") ||
      err.message?.includes("newer catalogue modifications") ||
      err.message?.includes("has already been rolled back") ||
      err.message?.includes("Import snapshot")
    ) {
      return res.status(400).json({
        success: false,
        message: err.message || err.reason,
      });
    }

    res.status(500).json({
      success: false,
      message: `Rollback failed: ${err.message}`,
    });
  } finally {
    releaseMutationLock();
  }
});

// GET /api/products/bulk-import/history - View Import History & Rollback Candidates (Admin Only)
router.get("/bulk-import/history", requireAdmin, (req, res) => {
  res.json({
    success: true,
    history: getImportHistory(),
  });
});

export default router;
