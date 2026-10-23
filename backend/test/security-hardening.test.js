import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authRouter, { generateToken } from "../src/routes/auth.js";
import productsRouter from "../src/routes/products.js";
import ordersRouter from "../src/routes/orders.js";
import { getJwtSecret, validateAuthConfig, JWT_ALGORITHM } from "../src/middleware/auth.js";
import { authLoginLimiter, authRegisterLimiter } from "../src/middleware/rateLimiter.js";
import { usersStore } from "../src/data/users.js";

dotenv.config();

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.set("trust proxy", 1);
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  return app;
};

test("1. Missing or short JWT_SECRET prevents startup and throws fatal error", () => {
  const originalSecret = process.env.JWT_SECRET;

  try {
    // 1a. Test missing secret
    delete process.env.JWT_SECRET;
    assert.throws(
      () => validateAuthConfig(),
      /FATAL: Missing JWT_SECRET/,
      "Must throw when JWT_SECRET is missing"
    );

    // 1b. Test short secret (< 32 chars)
    process.env.JWT_SECRET = "insecure_short_secret";
    assert.throws(
      () => validateAuthConfig(),
      /FATAL: JWT_SECRET must be at least 32 characters long/,
      "Must throw when JWT_SECRET is too short"
    );
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }
});

test("2. Valid JWT token signed with HS256 is accepted and returns authenticated profile", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/me`;

  try {
    const user = usersStore.find((u) => u.role === "user");
    assert.ok(user);

    const token = generateToken(user);
    const res = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.id, user.id);
    assert.equal(data.user.email, user.email);
    assert.equal(data.user.role, "user");
  } finally {
    server.close();
  }
});

test("3. Expired JWT is rejected with 401 Unauthorized", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/me`;

  try {
    const user = usersStore.find((u) => u.role === "user");

    // Token expired in the past
    const expiredToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      getJwtSecret(),
      { algorithm: JWT_ALGORITHM, expiresIn: -30 }
    );

    const res = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("expired"));
  } finally {
    server.close();
  }
});

test("4. Invalid signature is rejected with 401 Unauthorized", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/me`;

  try {
    const user = usersStore.find((u) => u.role === "user");

    // Signed with forged foreign secret
    const forgedToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: "admin" },
      "forged_foreign_attacker_secret_at_least_32_characters_long",
      { algorithm: "HS256", expiresIn: "1h" }
    );

    const res = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("invalid"));
  } finally {
    server.close();
  }
});

test("5. Malformed JWT token is rejected with 401 Unauthorized", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/me`;

  try {
    const res = await fetch(baseUrl, {
      headers: { Authorization: "Bearer this.is.not.a.valid.jwt" },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("invalid"));
  } finally {
    server.close();
  }
});

test("6. Unsupported signing algorithm (alg 'none' / spoofing) is rejected with 401", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/me`;

  try {
    // Unsigned token with alg: "none"
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ id: "usr_user_01", role: "admin" })).toString("base64url");
    const noneToken = `${header}.${payload}.`;

    const res = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${noneToken}` },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  } finally {
    server.close();
  }
});

test("7. Missing Authorization header returns 401 Unauthorized", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/me`;

  try {
    const res = await fetch(baseUrl);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("missing"));
  } finally {
    server.close();
  }
});

test("8. Customer role cannot access admin endpoints (403 Forbidden)", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/products`;

  try {
    const customerUser = usersStore.find((u) => u.role === "user");
    const token = generateToken(customerUser);

    // Attempt to create a product as a customer
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Unauthorized Sneaker",
        price: 99,
        category: "casual",
      }),
    });

    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("administrator privileges"));
  } finally {
    server.close();
  }
});

test("9. Customer privilege escalation via registration is prevented", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/register`;

  try {
    authRegisterLimiter.reset();

    const uniqueEmail = `attacker_${Date.now()}@test.com`;

    // Attempting to register with role: 'admin'
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Privilege Escalation Attacker",
        email: uniqueEmail,
        password: "securePassword123",
        role: "admin", // Malicious payload
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);

    // Role MUST be forced to 'user'
    assert.equal(
      data.user.role,
      "user",
      "Public registration must strictly force role to 'user'"
    );

    // Verify token cannot access admin endpoint
    const adminCheck = await fetch(`http://localhost:${port}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ title: "Hack", price: 10 }),
    });

    assert.equal(adminCheck.status, 403);
  } finally {
    server.close();
  }
});

test("10. Login endpoint rate limiting returns 429 Too Many Requests when threshold exceeded", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/login`;

  try {
    authLoginLimiter.reset();

    // 10 failed login attempts allowed
    for (let i = 0; i < 10; i++) {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@shop.co", password: "wrongpassword" }),
      });
      assert.equal(res.status, 401);
    }

    // 11th request must be rate limited
    const resBlocked = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@shop.co", password: "wrongpassword" }),
    });

    assert.equal(resBlocked.status, 429);
    assert.ok(resBlocked.headers.get("retry-after"));
    const data = await resBlocked.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("too many login attempts"));
  } finally {
    authLoginLimiter.reset();
    server.close();
  }
});

test("11. Registration endpoint rate limiting returns 429 Too Many Requests when threshold exceeded", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth/register`;

  try {
    authRegisterLimiter.reset();

    // 5 registrations allowed per window
    for (let i = 0; i < 5; i++) {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `User ${i}`,
          email: `reg_limit_${Date.now()}_${i}@test.com`,
          password: "password123",
        }),
      });
      assert.equal(res.status, 201);
    }

    // 6th registration should trigger 429
    const resBlocked = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User Blocked",
        email: `reg_blocked_${Date.now()}@test.com`,
        password: "password123",
      }),
    });

    assert.equal(resBlocked.status, 429);
    assert.ok(resBlocked.headers.get("retry-after"));
    const data = await resBlocked.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("too many accounts"));
  } finally {
    authRegisterLimiter.reset();
    server.close();
  }
});

test("12. Public product browsing remains unauthenticated and unrestricted", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/products`;

  try {
    const res = await fetch(`${baseUrl}?limit=5`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.equal(data.products.length, 5);
  } finally {
    server.close();
  }
});
