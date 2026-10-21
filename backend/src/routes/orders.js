import express from "express";

const router = express.Router();

// In-memory order storage
const ordersStore = new Map();

// POST create new order
router.post("/", (req, res) => {
  try {
    const { customer, items, subtotal, discount, deliveryFee, total, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    if (!customer || !customer.fullName || !customer.address) {
      return res.status(400).json({ success: false, message: "Customer shipping information is required." });
    }

    const orderId = `SHOP-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    const newOrder = {
      orderId,
      status: "confirmed",
      createdAt,
      estimatedDelivery: deliveryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      customer,
      items,
      pricing: {
        subtotal: Number(subtotal).toFixed(2),
        discount: Number(discount).toFixed(2),
        deliveryFee: Number(deliveryFee || 0).toFixed(2),
        total: Number(total).toFixed(2),
      },
      paymentMethod: paymentMethod || "card",
    };

    ordersStore.set(orderId, newOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET order by ID
router.get("/:orderId", (req, res) => {
  const { orderId } = req.params;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, order });
});

export default router;
