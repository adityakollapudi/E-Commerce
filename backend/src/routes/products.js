import express from "express";
import { PRODUCTS } from "../data/products.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Dynamic in-memory products catalog initialized from seed data
let productsCatalog = [...PRODUCTS];

// GET all products with filtering, search, sorting, and pagination
router.get("/", (req, res) => {
  try {
    const {
      category,
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

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.style?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== "all") {
      const cat = decodeURIComponent(category).toLowerCase();
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === cat ||
          p.style?.toLowerCase() === cat
      );
    }

    // Dress Style filter
    if (style && style !== "all") {
      const s = decodeURIComponent(style).toLowerCase();
      result = result.filter((p) => p.style?.toLowerCase() === s);
    }

    // Price range filter
    if (minPrice !== undefined) {
      result = result.filter((p) => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice !== undefined) {
      result = result.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    // Size filter
    if (size) {
      const sizesArray = Array.isArray(size) ? size : [size];
      result = result.filter((p) =>
        p.sizes && p.sizes.some((s) => sizesArray.includes(s))
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

    // Pagination
    const totalCount = result.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = result.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      products: paginatedItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET New Arrivals
router.get("/featured/new-arrivals", (req, res) => {
  const limit = parseInt(req.query.limit) || 4;
  const newArrivals = productsCatalog.filter((p) => p.isNew).slice(0, limit);
  res.json({ success: true, count: newArrivals.length, products: newArrivals });
});

// GET Best Sellers
router.get("/featured/best-sellers", (req, res) => {
  const limit = parseInt(req.query.limit) || 4;
  const bestSellers = productsCatalog.filter((p) => p.isBestSeller).slice(0, limit);
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

// GET single product by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = productsCatalog.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Related products
  const related = productsCatalog
    .filter(
      (p) => p.id !== id && (p.category === product.category || p.style === product.style)
    )
    .slice(0, 4);

  res.json({ success: true, product, related });
});

// POST /api/products - Create New Product (Admin Only)
router.post("/", requireAdmin, (req, res) => {
  try {
    const {
      title,
      price,
      originalPrice,
      category,
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

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Product title is required." });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "A valid positive price is required." });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }

    const numericPrice = Number(price);
    const numericOriginalPrice = Number(originalPrice) || numericPrice;
    const discount =
      numericOriginalPrice > numericPrice
        ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
        : 0;

    const newId = Date.now();
    const primaryImg =
      image ||
      (Array.isArray(images) && images.length > 0 ? images[0] : null) ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

    const allImages =
      Array.isArray(images) && images.length > 0
        ? images
        : [primaryImg];

    // Normalize features into array
    let parsedFeatures = [];
    if (Array.isArray(features)) {
      parsedFeatures = features.filter(Boolean);
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

    const newProduct = {
      id: newId,
      sku: sku ? sku.trim() : `PRD-${newId.toString().slice(-6)}`,
      brand: brand ? brand.trim() : "SHOP.CO",
      title: title.trim(),
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      discountPercent: discount,
      category: category.trim().toLowerCase(),
      style: (style || "casual").trim().toLowerCase(),
      rating: { rate: 5.0, count: 1 },
      isNew: Boolean(isNew),
      isBestSeller: Boolean(isBestSeller),
      moq: Number(moq) || 1,
      deliveryDays: deliveryDays || "3–5 Days",
      unitLabel: "piece",
      priceNote: "Standard retail price",
      description:
        description && description.trim()
          ? description.trim()
          : `${title.trim()} crafted with premium attention to detail. Perfect addition to your collection.`,
      features: parsedFeatures,
      specs: specs || {
        Brand: brand ? brand.trim() : "SHOP.CO",
        Category: category.trim(),
        Style: style || "Casual",
        Warranty: "1 Year Official Guarantee",
      },
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : ["#000000", "#4F46E5"],
      img: primaryImg,
      images: allImages,
      createdAt: new Date().toISOString(),
      createdBy: req.user.email,
    };

    // Prepend to catalog so it appears first in the storefront
    productsCatalog.unshift(newProduct);

    res.status(201).json({
      success: true,
      message: "Product added successfully to catalog!",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Edit Existing Product (Admin Only)
router.put("/:id", requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = productsCatalog.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const existing = productsCatalog[index];
    const updates = req.body;

    const numericPrice = updates.price !== undefined ? Number(updates.price) : existing.price;
    const numericOriginal =
      updates.originalPrice !== undefined ? Number(updates.originalPrice) : existing.originalPrice;
    const discount =
      numericOriginal > numericPrice
        ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
        : 0;

    const updatedProduct = {
      ...existing,
      ...updates,
      id, // Preserve ID
      price: numericPrice,
      originalPrice: numericOriginal,
      discountPercent: discount,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email,
    };

    productsCatalog[index] = updatedProduct;

    res.json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Delete Product (Admin Only)
router.delete("/:id", requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const initialLen = productsCatalog.length;
    productsCatalog = productsCatalog.filter((p) => p.id !== id);

    if (productsCatalog.length === initialLen) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.json({
      success: true,
      message: `Product #${id} was deleted successfully from the catalog.`,
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
