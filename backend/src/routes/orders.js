import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { findCatalogProductById, normalizeSize } from "./products.js";
import { VALID_COUPONS } from "./coupons.js";
import { orderCreationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Authoritative in-memory orders store
export const ordersStore = new Map();

// In-memory idempotency store to prevent duplicate orders
// Key: `${userId}:${idempotencyKey}` -> { status: "processing" | "completed", response, orderId, createdAt }
export const idempotencyStore = new Map();

// POST /api/orders - Create new order (Requires Authentication + Rate Limited)
router.post("/", authenticateToken, orderCreationLimiter, (req, res) => {
  let storeKey = null;

  try {
    const rawKey = req.headers["idempotency-key"] || req.body?.idempotencyKey;
    const idempotencyKey = rawKey ? String(rawKey).trim() : null;

    if (idempotencyKey) {
      storeKey = `${req.user.id}:${idempotencyKey}`;
      const existing = idempotencyStore.get(storeKey);

      if (existing) {
        if (existing.status === "completed") {
          // Idempotent replay: Return cached order confirmation without creating a new order
          return res.status(200).json({
            ...existing.response,
            isIdempotentReplay: true,
          });
        }
        if (existing.status === "processing") {
          return res.status(409).json({
            success: false,
            message: "Order is currently being processed with this idempotency key. Please wait.",
          });
        }
      }

      // Mark as in-flight
      idempotencyStore.set(storeKey, {
        status: "processing",
        createdAt: Date.now(),
      });
    }

    const abortIdempotency = () => {
      if (storeKey) {
        idempotencyStore.delete(storeKey);
      }
    };

    const { customer, items, paymentMethod, promoCode } = req.body;

    // 1. Validate customer shipping details
    if (!customer || typeof customer !== "object") {
      abortIdempotency();
      return res.status(400).json({
        success: false,
        message: "Customer shipping information is required.",
      });
    }

    const fullName = typeof customer.fullName === "string" ? customer.fullName.trim() : "";
    const address = typeof customer.address === "string" ? customer.address.trim() : "";
    const city = typeof customer.city === "string" ? customer.city.trim() : "";
    const postalCode = typeof customer.postalCode === "string" ? customer.postalCode.trim() : "";

    if (!fullName || !address || !city || !postalCode) {
      abortIdempotency();
      return res.status(400).json({
        success: false,
        message: "All shipping fields (full name, address, city, and postal code) are required.",
      });
    }

    if (fullName.length > 100 || address.length > 250 || city.length > 100 || postalCode.length > 20) {
      abortIdempotency();
      return res.status(400).json({
        success: false,
        message: "One or more shipping fields exceed maximum allowed character limits.",
      });
    }

    // 2. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      abortIdempotency();
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    if (items.length > 50) {
      abortIdempotency();
      return res.status(400).json({
        success: false,
        message: "Order cannot contain more than 50 distinct items.",
      });
    }

    // 3. Validate every item against live backend catalog & derive authoritative prices
    const verifiedItems = [];

    for (const it of items) {
      if (!it || it.id === undefined || it.id === null) {
        abortIdempotency();
        return res.status(400).json({
          success: false,
          message: "Each order item must specify a valid product ID.",
        });
      }

      const product = findCatalogProductById(it.id);
      if (!product) {
        abortIdempotency();
        return res.status(404).json({
          success: false,
          message: `Product #${it.id} was not found in the catalog or is no longer available.`,
        });
      }

      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
        abortIdempotency();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity "${it.quantity}" for product "${product.title}". Quantity must be a whole number between 1 and 100.`,
        });
      }

      // Authoritative unit price derived strictly from backend catalog
      const unitPrice = Number(product.price);
      const chosenSize = it.size ? normalizeSize(it.size) : (product.sizes?.[0] || "M");
      const lineTotal = Number((unitPrice * qty).toFixed(2));

      verifiedItems.push({
        id: product.id,
        title: product.title,
        price: unitPrice,
        quantity: qty,
        size: chosenSize,
        selectedColor: it.selectedColor || (product.colors?.[0] || null),
        image: product.img || (product.images && product.images[0]) || null,
        category: product.category || "general",
        lineTotal,
      });
    }

    // 4. Server-authoritative calculation of subtotal, discounts, delivery fee, and total
    const subtotal = Number(
      verifiedItems.reduce((acc, it) => acc + it.price * it.quantity, 0).toFixed(2)
    );

    let discountPercent = 0;
    let freeShipping = false;
    let validatedPromoCode = null;

    if (promoCode) {
      const normalizedCode = String(promoCode).trim().toUpperCase();
      const coupon = VALID_COUPONS[normalizedCode];

      if (!coupon) {
        abortIdempotency();
        return res.status(400).json({
          success: false,
          message: `Invalid coupon code: "${promoCode}".`,
        });
      }

      discountPercent = coupon.discountPercent || 0;
      freeShipping = Boolean(coupon.freeShipping);
      validatedPromoCode = normalizedCode;
    }

    const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
    const deliveryFee = freeShipping || subtotal === 0 ? 0 : 15;
    const total = Number(Math.max(0, subtotal - discountAmount + deliveryFee).toFixed(2));

    // 5. Build authoritative order record
    const orderId = `SHOP-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    const newOrder = {
      orderId,
      userId: req.user.id,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
      status: "confirmed",
      createdAt,
      estimatedDelivery: deliveryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      customer: {
        fullName,
        email: (customer.email || req.user.email).trim(),
        address,
        city,
        postalCode,
      },
      items: verifiedItems,
      pricing: {
        subtotal,
        discount: discountAmount,
        discountPercent,
        deliveryFee,
        total,
        promoCode: validatedPromoCode,
      },
      paymentMethod: paymentMethod || "card",
    };

    // 6. Record order in current persistence store
    ordersStore.set(orderId, newOrder);

    const responsePayload = {
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    };

    // 7. Complete idempotency record
    if (storeKey) {
      idempotencyStore.set(storeKey, {
        status: "completed",
        response: responsePayload,
        orderId,
        createdAt: Date.now(),
      });
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    if (storeKey) {
      idempotencyStore.delete(storeKey);
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders - List orders (Authenticated: Customer sees own, Admin sees all)
router.get("/", authenticateToken, (req, res) => {
  try {
    const all = Array.from(ordersStore.values());
    let results = [];

    if (req.user.role === "admin") {
      results = all;
    } else {
      results = all.filter((o) => o.userId === req.user.id);
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: results.length,
      orders: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:orderId - Fetch order by ID (Enforces ownership boundary)
router.get("/:orderId", authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params;
    const order = ordersStore.get(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Enforce ownership: Non-admin users can only view their own orders
    if (req.user.role !== "admin" && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to view this order.",
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
