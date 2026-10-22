import express from "express";
// SHOP.CO Dual-Port Unified Backend Server
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import couponsRouter from "./routes/coupons.js";
import authRouter from "./routes/auth.js";
import uploadRouter from "./routes/upload.js";
import { validateAuthConfig } from "./middleware/auth.js";
import { quoteRequestLimiter } from "./middleware/rateLimiter.js";
import { validateQuotePayload } from "./middleware/validation.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

// Ensure uploads folder exists on startup
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Fail fast on startup if security environment variables are missing or insecure
try {
  validateAuthConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const USER_PORT = parseInt(process.env.USER_PORT || process.env.PORT || "5000", 10);
const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || "5001", 10);

/**
 * Creates an Express app instance configured for either:
 * - User Storefront: Read-only for catalogue products (POST/PUT/DELETE/bulk-import blocked)
 * - Admin Management: Full CRUD, bulk import, and inventory editing (protected by auth)
 * Both apps share the exact same underlying catalogStore, orders, and coupons database.
 */
export const createApp = ({ isUserPort = false, port = USER_PORT, peerPort = ADMIN_PORT } = {}) => {
  const app = express();

  // Enable trust proxy for accurate client IP resolution behind reverse proxies
  app.set("trust proxy", 1);

  // Middleware with explicit payload size limit to prevent memory exhaustion
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    })
  );

  // Serve uploaded images statically on both User Port and Admin Port
  app.use("/uploads", express.static(uploadsDir));

  // Support up to 25MB for image uploads
  app.use("/api/upload", express.json({ limit: "25mb" }));
  // Support up to 10MB for product payloads (can include data URLs or large features)
  app.use("/api/products", express.json({ limit: "10mb" }));
  // Support up to 5MB for bulk import batches (max 500 items with rich descriptions)
  app.use("/api/products/bulk-import", express.json({ limit: "5mb" }));
  // Enforce strict 100KB limit for all other standard endpoints to prevent memory exhaustion
  app.use(express.json({ limit: "100kb" }));

  // Request logger with port role identifier
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const roleLabel = isUserPort ? "USER-PORT" : "ADMIN-PORT";
      console.log(`[${roleLabel}:${port}] [${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: isUserPort
        ? "SHOP.CO User Storefront API (View & Checkout)"
        : "SHOP.CO Admin Management API (Full CRUD & Import)",
      role: isUserPort ? "user" : "admin",
      port,
      peerPort,
      catalogueEditingAllowed: !isUserPort,
      sharedDatabase: "catalogStore & catalog.json",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Quote Request Endpoint (Corporate Gifting) - Protected by rate limiter and payload validation
  app.post("/api/quote", quoteRequestLimiter, validateQuotePayload, (req, res) => {
    const { productId, productTitle, quantity, brandingOption, companyName, contactEmail, contactPhone, notes } = req.body;

    const quoteId = `QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;
    res.status(201).json({
      success: true,
      message: "Bulk quotation inquiry received! Our sales representative will contact you within 2 hours.",
      quote: {
        quoteId,
        productId: productId || null,
        productTitle: typeof productTitle === "string" ? productTitle.slice(0, 200) : "Custom Inquiry",
        quantity: quantity || 100,
        brandingOption: brandingOption || "UV Digital Print",
        companyName: companyName ? companyName.trim() : "Corporate Client",
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone ? contactPhone.trim() : null,
        notes: notes ? notes.slice(0, 1000) : "",
        status: "pending_review",
        createdAt: new Date().toISOString(),
      },
    });
  });

  // Mount auth router
  app.use("/api/auth", authRouter);

  // USER PORT RESTRICTION: Strictly block product catalogue mutations and uploads on User Port
  if (isUserPort) {
    app.use("/api/upload", (req, res) => {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN_PORT_MUTATION",
        message: `Image uploads are disabled on the User Storefront port (${port}). Please perform uploads on the Admin Management port (${peerPort}).`,
        userPort: port,
        adminPort: peerPort,
      });
    });

    app.use("/api/products", (req, res, next) => {
      const isMutationMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
      const isImportPath = req.originalUrl && req.originalUrl.includes("/bulk-import");

      if (isMutationMethod || isImportPath) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN_PORT_MUTATION",
          message: `Catalogue modification and product mutations are disabled on the User Storefront port (${port}). Please perform editing on the Admin Management port (${peerPort}).`,
          userPort: port,
          adminPort: peerPort,
        });
      }
      next();
    });
  }

  // Mount shared modular routes (Both apps share the SAME in-memory catalogStore and catalog.json file!)
  app.use("/api/upload", uploadRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/coupons", couponsRouter);

  // 404 handler for unknown API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found" });
  });

  // Centralized error handling middleware (prevents leaking internal stack traces)
  app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
      const isBulk = req.originalUrl && req.originalUrl.includes("/api/products/bulk-import");
      const isUpload = req.originalUrl && req.originalUrl.includes("/api/upload");
      return res.status(413).json({
        success: false,
        message: isUpload
          ? "Request payload too large. Maximum allowed size for image upload is 25MB."
          : isBulk
          ? "Request payload too large. Maximum allowed size for bulk import is 5MB."
          : "Request payload too large. Maximum allowed size is 100KB.",
      });
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        success: false,
        message: "Malformed JSON payload in request body.",
      });
    }
    console.error("Unhandled error:", err.message);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  });

  return app;
};

// Instantiate the two specialized Express apps
export const userApp = createApp({ isUserPort: true, port: USER_PORT, peerPort: ADMIN_PORT });
export const adminApp = createApp({ isUserPort: false, port: ADMIN_PORT, peerPort: USER_PORT });

// Start both dual-port servers
export const startServers = () => {
  const servers = {};

  // 1. User Storefront API Listener (Port 5000)
  const userServer = userApp.listen(USER_PORT, () => {
    console.log(`🚀 SHOP.CO User Storefront API running on http://localhost:${USER_PORT}`);
    console.log(`   Role: Customer View & Checkout (Mutations blocked)`);
    console.log(`   Health check: http://localhost:${USER_PORT}/api/health`);
  });

  userServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ User port ${USER_PORT} is in use (e.g. background server running).`);
    } else {
      console.error("User server error:", err);
    }
  });
  servers.userServer = userServer;

  // 2. Admin Management API Listener (Port 5001)
  const adminServer = adminApp.listen(ADMIN_PORT, () => {
    console.log(`🛡️ SHOP.CO Admin Management API running on http://localhost:${ADMIN_PORT}`);
    console.log(`   Role: Admin Management (Full Edit & Bulk Import enabled)`);
    console.log(`   Health check: http://localhost:${ADMIN_PORT}/api/health`);
    console.log(`📦 Shared Database: Single synchronized catalogStore & catalog.json`);
  });

  adminServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Admin port ${ADMIN_PORT} is in use (e.g. background server running).`);
    } else {
      console.error("Admin server error:", err);
    }
  });
  servers.adminServer = adminServer;

  return servers;
};

// Start servers on direct startup (prevent starting background listeners during automated test runs)
const isTestRunner = process.env.NODE_ENV === "test" || process.argv.some((arg) => arg.includes("test"));
if (!isTestRunner) {
  startServers();
}

// Default export is adminApp for complete backwards compatibility with tests and app.listen(0)
export default adminApp;

