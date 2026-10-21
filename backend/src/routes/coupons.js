import express from "express";

const router = express.Router();

const VALID_COUPONS = {
  SHOP20: { discountPercent: 20, freeShipping: false, description: "20% off entire order" },
  SAVE30: { discountPercent: 30, freeShipping: false, description: "30% off big discount" },
  FREESHIP: { discountPercent: 0, freeShipping: true, description: "Free standard shipping" },
  WELCOME10: { discountPercent: 10, freeShipping: false, description: "10% welcome coupon" },
};

// POST validate coupon
router.post("/validate", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code is required" });
  }

  const normalized = code.trim().toUpperCase();
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
