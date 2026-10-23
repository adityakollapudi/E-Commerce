import express from "express";
import { couponValidateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

export const VALID_COUPONS = {
  SHOP20: { discountPercent: 20, freeShipping: false, description: "20% off entire order" },
  SAVE30: { discountPercent: 30, freeShipping: false, description: "30% off big discount" },
  FREESHIP: { discountPercent: 0, freeShipping: true, description: "Free standard shipping" },
  WELCOME10: { discountPercent: 10, freeShipping: false, description: "10% welcome coupon" },
};

// POST /api/coupons/validate - Validate coupon (Rate limited to 25 attempts/10m)
router.post("/validate", couponValidateLimiter, (req, res) => {
  const { code } = req.body || {};

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({
      success: false,
      message: "Coupon code is required and must be a valid string.",
    });
  }

  const cleanCode = code.trim();
  if (cleanCode.length > 30) {
    return res.status(400).json({
      success: false,
      message: "Coupon code cannot exceed 30 characters.",
    });
  }

  const normalized = cleanCode.toUpperCase();
  const coupon = VALID_COUPONS[normalized];

  if (coupon) {
    res.json({
      success: true,
      code: normalized,
      ...coupon,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid coupon code. Try 'SHOP20' or 'FREESHIP'",
    });
  }
});

export default router;
