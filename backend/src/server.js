import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import couponsRouter from "./routes/coupons.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SHOP.CO Corporate Gifts & E-commerce Backend API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Quote Request Endpoint (Corporate Gifting)
app.post("/api/quote", (req, res) => {
  const { productId, productTitle, quantity, brandingOption, companyName, contactEmail, contactPhone, notes } = req.body;

  const quoteId = `QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;
  res.status(201).json({
    success: true,
    message: "Bulk quotation inquiry received! Our sales representative will contact you within 2 hours.",
    quote: {
      quoteId,
      productId,
      productTitle,
      quantity: quantity || 100,
      brandingOption: brandingOption || "UV Digital Print",
      companyName: companyName || "Corporate Client",
      contactEmail,
      contactPhone,
      status: "pending_review",
      createdAt: new Date().toISOString(),
    },
  });
});

// Mount modular routes
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/coupons", couponsRouter);

// 404 handler for unknown API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Start server with automatic port recovery if port 5000 has a lingering socket
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 SHOP.CO Backend server is running on http://localhost:${port}`);
    console.log(`   Health check: http://localhost:${port}/api/health`);
    console.log(`   Products API: http://localhost:${port}/api/products`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} is currently busy, auto-switching to http://localhost:${Number(port) + 1}...`);
      startServer(Number(port) + 1);
    } else {
      console.error("Server error:", err);
    }
  });
};

startServer(DEFAULT_PORT);

export default app;
