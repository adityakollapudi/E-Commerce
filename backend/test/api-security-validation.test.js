import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import productsRouter from "../src/routes/products.js";
import ordersRouter from "../src/routes/orders.js";
import couponsRouter from "../src/routes/coupons.js";
import authRouter from "../src/routes/auth.js";
import { getJwtSecret, JWT_ALGORITHM } from "../src/middleware/auth.js";
import {
  couponValidateLimiter,
  orderCreationLimiter,
  quoteRequestLimiter,
} from "../src/middleware/rateLimiter.js";
import { validateQuotePayload } from "../src/middleware/validation.js";
import { usersStore } from "../src/data/users.js";

dotenv.config();

const createTestApp = () => {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "100kb" }));

  // Corporate quote route
  app.post("/api/quote", quoteRequestLimiter, validateQuotePayload, (req, res) => {
    res.status(201).json({ success: true, message: "Quote received" });
  });

  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/coupons", couponsRouter);
  app.use("/api/auth", authRouter);

  // Centralized error handler
  app.use((err, req, res, next) => {
    if (err.type === "entity.too.large") {
      return res.status(413).json({ success: false, message: "Payload too large." });
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ success: false, message: "Malformed JSON payload in request body." });
    }
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  });

  return app;
};

const getAdminToken = () => {
  const admin = usersStore.find((u) => u.role === "admin");
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
    getJwtSecret(),
    { algorithm: JWT_ALGORITHM, expiresIn: "1h" }
  );
};

const getCustomerToken = () => {
  const user = usersStore.find((u) => u.role === "user");
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    getJwtSecret(),
    { algorithm: JWT_ALGORITHM, expiresIn: "1h" }
  );
};

test("1. Reject invalid product creation payloads (missing title, invalid prices, empty category)", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/products`;
  const adminToken = getAdminToken();

  try {
    // 1a. Missing title
    const resNoTitle = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ price: 100, category: "casual" }),
    });
    assert.equal(resNoTitle.status, 400);

    // 1b. Negative price
    const resNegPrice = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: "Valid Title", price: -50, category: "casual" }),
    });
    assert.equal(resNegPrice.status, 400);

    // 1c. NaN price
    const resNaNPrice = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: "Valid Title", price: "not_a_number", category: "casual" }),
    });
    assert.equal(resNaNPrice.status, 400);

    // 1d. Missing category
    const resNoCat = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: "Valid Title", price: 100 }),
    });
    assert.equal(resNoCat.status, 400);
  } finally {
    server.close();
  }
});

test("2. Reject malformed product IDs on GET, PUT, and DELETE with 400", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const adminToken = getAdminToken();

  try {
    const invalidIds = ["abc", "0", "-5", "1.5", "undefined", "null"];

    for (const badId of invalidIds) {
      // GET
      const getRes = await fetch(`http://localhost:${port}/api/products/${badId}`);
      assert.equal(getRes.status, 400, `GET with id '${badId}' should return 400`);

      // PUT
      const putRes = await fetch(`http://localhost:${port}/api/products/${badId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ price: 120 }),
      });
      assert.equal(putRes.status, 400, `PUT with id '${badId}' should return 400`);

      // DELETE
      const delRes = await fetch(`http://localhost:${port}/api/products/${badId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(delRes.status, 400, `DELETE with id '${badId}' should return 400`);
    }
  } finally {
    server.close();
  }
});

test("3. Product updates safely sanitize inputs and strictly protect immutable internal fields", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const adminToken = getAdminToken();

  try {
    // 1. Create a product first
    const createRes = await fetch(`http://localhost:${port}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Original Test Shirt",
        price: 250,
        category: "casual",
      }),
    });
    assert.equal(createRes.status, 201);
    const { product } = await createRes.json();
    const productId = product.id;
    const originalCreatedAt = product.createdAt;
    const originalCreatedBy = product.createdBy;

    // 2. Attempt update trying to overwrite protected fields (id, createdAt, createdBy)
    const updateRes = await fetch(`http://localhost:${port}/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        id: 9999999,                    // TAMPER ATTEMPT
        createdAt: "1999-01-01T00:00:00Z", // TAMPER ATTEMPT
        createdBy: "hacker@evil.com",    // TAMPER ATTEMPT
        price: 320,                      // VALID UPDATE
        title: "Updated Secure Shirt",  // VALID UPDATE
      }),
    });

    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    const updated = updateData.product;

    // Verify valid fields updated
    assert.equal(updated.price, 320);
    assert.equal(updated.title, "Updated Secure Shirt");

    // Verify protected internal fields were NOT tampered
    assert.equal(updated.id, productId, "Product ID must remain immutable");
    assert.equal(updated.createdAt, originalCreatedAt, "createdAt must remain immutable");
    assert.equal(updated.createdBy, originalCreatedBy, "createdBy must remain immutable");
  } finally {
    server.close();
  }
});

test("4. Non-admin customer cannot perform product mutations (403 Forbidden)", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const customerToken = getCustomerToken();

  try {
    // Customer PUT
    const putRes = await fetch(`http://localhost:${port}/api/products/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ price: 10 }),
    });
    assert.equal(putRes.status, 403);

    // Customer DELETE
    const delRes = await fetch(`http://localhost:${port}/api/products/1`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(delRes.status, 403);
  } finally {
    server.close();
  }
});

test("5. Pagination and sorting validation clamps limits safely", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // Requesting excessive limit=5000 must be clamped to max 100
    const resClamped = await fetch(`http://localhost:${port}/api/products?limit=5000`);
    assert.equal(resClamped.status, 200);
    const dataClamped = await resClamped.json();
    assert.equal(dataClamped.limit, 100, "Limit must be clamped to safe ceiling of 100");

    // Negative page should return 400
    const resBadPage = await fetch(`http://localhost:${port}/api/products?page=-1`);
    assert.equal(resBadPage.status, 400);

    // Negative price should return 400
    const resBadPrice = await fetch(`http://localhost:${port}/api/products?minPrice=-10`);
    assert.equal(resBadPrice.status, 400);
  } finally {
    server.close();
  }
});

test("6. Search and filter queries handle oversized inputs and malformed encodings safely", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // Pathological oversized search string (1000 characters)
    const longSearch = "a".repeat(1000);
    const resLong = await fetch(`http://localhost:${port}/api/products?search=${longSearch}`);
    assert.equal(resLong.status, 200);

    // Malformed URI encoding does not crash server with unhandled 500
    const resMalformedUri = await fetch(`http://localhost:${port}/api/products?category=%E0%A4%A`);
    assert.equal(resMalformedUri.status, 200);
  } finally {
    server.close();
  }
});

test("7. Coupon validation abuse protection triggers 429 when threshold exceeded", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/coupons/validate`;

  try {
    couponValidateLimiter.reset();

    // 1. Non-string coupon rejected with 400
    const resNonString = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: 12345 }),
    });
    assert.equal(resNonString.status, 400);

    // 2. Test rate limiting (25 attempts allowed)
    couponValidateLimiter.reset();
    for (let i = 0; i < 25; i++) {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: `PROMO_${i}` }),
      });
      assert.ok([200, 400].includes(res.status));
    }

    // 26th attempt must be rate-limited (429)
    const resBlocked = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "SPAM_CODE" }),
    });
    assert.equal(resBlocked.status, 429);
    assert.ok(resBlocked.headers.get("retry-after"));
  } finally {
    couponValidateLimiter.reset();
    server.close();
  }
});

test("8. Order creation rate limiting triggers 429 when threshold exceeded", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;
  const token = getCustomerToken();

  try {
    orderCreationLimiter.reset();

    // 20 order attempts allowed
    for (let i = 0; i < 20; i++) {
      await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customer: { fullName: "User", address: "St", city: "City", postalCode: "12345" },
          items: [{ id: 1, quantity: 1 }],
        }),
      });
    }

    // 21st attempt must be blocked with 429
    const blockedRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customer: { fullName: "User", address: "St", city: "City", postalCode: "12345" },
        items: [{ id: 1, quantity: 1 }],
      }),
    });
    assert.equal(blockedRes.status, 429);
  } finally {
    orderCreationLimiter.reset();
    server.close();
  }
});

test("9. Corporate quote endpoint validation and rate limiting", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/quote`;

  try {
    quoteRequestLimiter.reset();

    // Invalid email rejected
    const badEmailRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactEmail: "not_an_email", quantity: 50 }),
    });
    assert.equal(badEmailRes.status, 400);

    // 10 quote requests allowed
    quoteRequestLimiter.reset();
    for (let i = 0; i < 10; i++) {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactEmail: "client@corp.com", quantity: 100 }),
      });
      assert.equal(res.status, 201);
    }

    // 11th request triggers 429
    const blockedRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactEmail: "client@corp.com", quantity: 100 }),
    });
    assert.equal(blockedRes.status, 429);
  } finally {
    quoteRequestLimiter.reset();
    server.close();
  }
});

test("10. Oversized JSON request payload (>100KB) returns 413 Payload Too Large", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const adminToken = getAdminToken();

  try {
    // Generate > 120KB payload
    const largeString = "x".repeat(125 * 1024);
    const res = await fetch(`http://localhost:${port}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ title: "Large", price: 10, category: "c", notes: largeString }),
    });

    assert.equal(res.status, 413);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("payload too large"));
  } finally {
    server.close();
  }
});

test("11. Malformed JSON payload returns 400 with clean error and no stack trace", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"code": "SHOP20", broken_json_syntax',
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("malformed json"));
    assert.equal(data.stack, undefined, "Stack trace must never be leaked");
  } finally {
    server.close();
  }
});

test("12. Public product output sanitization omits admin createdBy and updatedBy emails", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/products?limit=10`);
    assert.equal(res.status, 200);
    const data = await res.json();

    for (const p of data.products) {
      assert.equal(p.createdBy, undefined, "Public product list must not expose createdBy email");
      assert.equal(p.updatedBy, undefined, "Public product list must not expose updatedBy email");
    }
  } finally {
    server.close();
  }
});
