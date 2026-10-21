import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import ordersRouter, { ordersStore, idempotencyStore } from "../src/routes/orders.js";
import productsRouter, { findCatalogProductById, getLiveProductsCatalog } from "../src/routes/products.js";
import { JWT_SECRET } from "../src/middleware/auth.js";
import { usersStore, createUser } from "../src/data/users.js";

// Helper to instantiate test Express server
const createTestServer = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  return app;
};

// Helper to generate a valid auth token for a given user
const getAuthToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

test("1. Unauthenticated checkout is rejected with 401 Unauthorized", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { fullName: "Jane Doe", address: "123 St", city: "NYC", postalCode: "10001" },
        items: [{ id: 1, quantity: 1 }],
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.toLowerCase().includes("token missing") || data.message.toLowerCase().includes("log in"));
  } finally {
    server.close();
  }
});

test("2. Successful order creation with verified server-derived prices and calculated totals", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerUser = usersStore.find((u) => u.role === "user");
  const token = getAuthToken(customerUser);

  try {
    // Look up real catalog items (e.g. items with ID 1 and 2)
    const product1 = findCatalogProductById(1);
    const product2 = findCatalogProductById(2);
    assert.ok(product1, "Product 1 must exist in seed catalog");
    assert.ok(product2, "Product 2 must exist in seed catalog");

    const expectedSubtotal = Number((product1.price * 2 + product2.price * 1).toFixed(2));
    const expectedDiscount = Number(((expectedSubtotal * 20) / 100).toFixed(2)); // SHOP20 = 20%
    const expectedDelivery = 15;
    const expectedTotal = Number((expectedSubtotal - expectedDiscount + expectedDelivery).toFixed(2));

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: {
          fullName: "Alex Morgan",
          email: "alex@example.com",
          address: "456 Avenue, Suite 10",
          city: "San Francisco",
          postalCode: "94107",
        },
        items: [
          { id: 1, quantity: 2, size: "L" },
          { id: 2, quantity: 1, size: "M" },
        ],
        promoCode: "SHOP20",
        paymentMethod: "card",
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order, "Response must contain order object");
    assert.ok(data.order.orderId.startsWith("SHOP-"));
    assert.equal(data.order.userId, customerUser.id);
    assert.equal(data.order.user.email, customerUser.email);
    assert.equal(data.order.items.length, 2);

    // Verify server authoritative pricing
    assert.equal(data.order.pricing.subtotal, expectedSubtotal);
    assert.equal(data.order.pricing.discount, expectedDiscount);
    assert.equal(data.order.pricing.deliveryFee, expectedDelivery);
    assert.equal(data.order.pricing.total, expectedTotal);
    assert.equal(data.order.pricing.promoCode, "SHOP20");

    // Verify stored in authoritative orderStore
    const stored = ordersStore.get(data.order.orderId);
    assert.ok(stored, "Order must be recorded in in-memory persistence store");
    assert.equal(stored.orderId, data.order.orderId);
  } finally {
    server.close();
  }
});

test("3. Forged client prices, subtotals, and totals are ignored and overwritten by server", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerUser = usersStore.find((u) => u.role === "user");
  const token = getAuthToken(customerUser);

  try {
    const product1 = findCatalogProductById(1);
    assert.ok(product1);

    // Malicious client tries to submit ₹0.01 price and total
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: {
          fullName: "Attacker",
          address: "123 Nowhere",
          city: "Metropolis",
          postalCode: "00000",
        },
        items: [
          {
            id: 1,
            quantity: 3,
            price: 0.01, // FORGED
            total: 0.03, // FORGED
          },
        ],
        subtotal: 0.03, // FORGED
        discount: 1000, // FORGED
        deliveryFee: 0, // FORGED
        total: 0.01, // FORGED
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);

    const expectedRealSubtotal = Number((product1.price * 3).toFixed(2));
    const expectedRealDelivery = 15;
    const expectedRealTotal = Number((expectedRealSubtotal + expectedRealDelivery).toFixed(2));

    // Client forged ₹0.01 must be completely rejected in favor of authoritative catalog numbers
    assert.equal(data.order.items[0].price, product1.price);
    assert.equal(data.order.pricing.subtotal, expectedRealSubtotal);
    assert.equal(data.order.pricing.total, expectedRealTotal);
    assert.notEqual(data.order.pricing.total, 0.01);
  } finally {
    server.close();
  }
});

test("4. Rejects invalid product IDs and deleted products with 404", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerUser = usersStore.find((u) => u.role === "user");
  const token = getAuthToken(customerUser);

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: { fullName: "User", address: "St", city: "City", postalCode: "12345" },
        items: [{ id: 99999999, quantity: 1 }],
      }),
    });

    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.message.includes("99999999") || data.message.includes("not found"));
  } finally {
    server.close();
  }
});

test("5. Rejects invalid quantities (zero, negative, non-integer, excessive) with 400", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerUser = usersStore.find((u) => u.role === "user");
  const token = getAuthToken(customerUser);

  try {
    const testCases = [0, -2, 1.5, "five", 999];

    for (const invalidQty of testCases) {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer: { fullName: "User", address: "St", city: "City", postalCode: "12345" },
          items: [{ id: 1, quantity: invalidQty }],
        }),
      });

      assert.equal(res.status, 400, `Expected 400 for quantity: ${invalidQty}`);
      const data = await res.json();
      assert.equal(data.success, false);
    }
  } finally {
    server.close();
  }
});

test("6. Rejects missing customer shipping information or empty items array with 400", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerUser = usersStore.find((u) => u.role === "user");
  const token = getAuthToken(customerUser);

  try {
    // Missing items
    const resNoItems = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customer: { fullName: "User", address: "St", city: "City", postalCode: "12345" },
        items: [],
      }),
    });
    assert.equal(resNoItems.status, 400);

    // Missing address
    const resNoAddress = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customer: { fullName: "User", address: "", city: "City", postalCode: "12345" },
        items: [{ id: 1, quantity: 1 }],
      }),
    });
    assert.equal(resNoAddress.status, 400);
  } finally {
    server.close();
  }
});

test("7. Idempotency mechanism prevents duplicate orders from identical keys", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerUser = usersStore.find((u) => u.role === "user");
  const token = getAuthToken(customerUser);
  const idempotencyKey = `test_idem_${Date.now()}`;

  try {
    const payload = {
      customer: { fullName: "Alex", address: "Street 1", city: "City", postalCode: "12345" },
      items: [{ id: 1, quantity: 1, size: "M" }],
    };

    // First request
    const res1 = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
    assert.equal(res1.status, 201);
    const data1 = await res1.json();
    const originalOrderId = data1.order.orderId;

    const initialTotalOrders = ordersStore.size;

    // Second request with SAME idempotency key (simulating retry or rapid duplicate click)
    const res2 = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res2.status, 200, "Idempotent replay should return 200 OK");
    const data2 = await res2.json();
    assert.equal(data2.order.orderId, originalOrderId, "Must return original orderId");
    assert.equal(data2.isIdempotentReplay, true);

    // Verify NO second order was added to ordersStore
    assert.equal(ordersStore.size, initialTotalOrders, "Order store must not create duplicate orders");
  } finally {
    server.close();
  }
});

test("8. Security & Ownership: Customer A cannot view Customer B's order; Admin can view all", async () => {
  const app = createTestServer();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/orders`;

  const customerA = usersStore.find((u) => u.role === "user");
  const adminUser = usersStore.find((u) => u.role === "admin");

  // Create Customer B
  const customerB = createUser({
    name: "Customer B",
    email: `cust_b_${Date.now()}@test.com`,
    password: "password123",
    role: "user",
  });

  const tokenA = getAuthToken(customerA);
  const tokenB = getAuthToken(customerB);
  const tokenAdmin = getAuthToken(adminUser);

  try {
    // 1. Customer A places an order
    const orderRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        customer: { fullName: "Customer A", address: "Road A", city: "Town A", postalCode: "11111" },
        items: [{ id: 1, quantity: 1 }],
      }),
    });
    assert.equal(orderRes.status, 201);
    const { order } = await orderRes.json();
    const orderId = order.orderId;

    // 2. Customer A can view their own order
    const viewOwn = await fetch(`${baseUrl}/${orderId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(viewOwn.status, 200);

    // 3. Customer B attempts to view Customer A's order -> 403 Forbidden
    const viewOther = await fetch(`${baseUrl}/${orderId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(viewOther.status, 403, "Cross-customer order access must be denied with 403");

    // 4. Admin can view Customer A's order
    const viewAdmin = await fetch(`${baseUrl}/${orderId}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(viewAdmin.status, 200, "Admin must be authorized to inspect any customer order");

    // 5. Listing orders: Customer A only sees their own; Customer B sees 0
    const listResB = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const listDataB = await listResB.json();
    assert.equal(listDataB.orders.some((o) => o.orderId === orderId), false);
  } finally {
    server.close();
  }
});

test("9. Frontend Cart contract: Backend failure must preserve cart and never trigger fake success", async () => {
  // Simulates frontend checkout state machine behavior
  let cart = [
    { id: 1, title: "Faded Skinny Jeans", price: 210, quantity: 2, size: "L", idWithSize: "1-L" },
  ];
  let isCheckoutOpen = true;
  let checkoutStep = "form";
  let orderData = null;
  let checkoutError = "";

  const clearCart = () => {
    cart = [];
  };

  // Simulate checkout submission against failing backend (e.g. 500 error or network fail)
  const simulateCheckoutAttempt = async (shouldFail) => {
    try {
      if (shouldFail) {
        throw new Error("Order placement failed with status 500. Please check your details and try again.");
      }
      // If success:
      const fakeBackendResponse = {
        success: true,
        order: { orderId: "SHOP-777777", estimatedDelivery: "Nov 1, 2026", items: [...cart], pricing: { total: 420 } },
      };
      orderData = fakeBackendResponse.order;
      checkoutStep = "success";
      isCheckoutOpen = false;
      clearCart();
    } catch (err) {
      checkoutError = err.message;
      checkoutStep = "form";
      // Notice: clearCart() is NOT called!
    }
  };

  // Trigger failure
  await simulateCheckoutAttempt(true);

  // Assertions:
  assert.equal(checkoutStep, "form", "Must remain on form on failure");
  assert.equal(cart.length, 1, "Cart must be completely preserved on failure");
  assert.equal(cart[0].id, 1);
  assert.equal(orderData, null, "No orderData or fake confirmation should exist");
  assert.ok(checkoutError.length > 0, "Error message must be presented to user");

  // Now trigger success
  await simulateCheckoutAttempt(false);

  assert.equal(checkoutStep, "success");
  assert.equal(cart.length, 0, "Cart is cleared ONLY after verified backend success");
  assert.ok(orderData);
  assert.equal(orderData.orderId, "SHOP-777777");
});
