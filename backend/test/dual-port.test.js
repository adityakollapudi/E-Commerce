import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { userApp, adminApp } from "../src/server.js";

// Helper to start ephemeral server for testing
const listenEphemeral = (app) => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, port: server.address().port });
    });
  });
};

const adminToken = jwt.sign(
  { id: "usr_admin_01", email: "admin@shop.co", role: "admin" },
  process.env.JWT_SECRET || "c7f92e4b8a1d035629c48b1a5e7f3d9204b68e1a3c7d5e9f2b4a8c1d3e5f7a9b",
  { expiresIn: "1h" }
);

test("1. User Port: GET /api/products succeeds (Customer View allowed)", async () => {
  const { server, port } = await listenEphemeral(userApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.ok(data.products.length > 0);
  } finally {
    server.close();
  }
});

test("2. User Port: POST /api/products is BLOCKED with 403 Forbidden", async () => {
  const { server, port } = await listenEphemeral(userApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Unauthorized User Port Product",
        price: 999,
        category: "casual",
      }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "FORBIDDEN_PORT_MUTATION");
    assert.match(data.message, /disabled on the User Storefront port/);
  } finally {
    server.close();
  }
});

test("3. User Port: PUT /api/products/:id is BLOCKED with 403 Forbidden", async () => {
  const { server, port } = await listenEphemeral(userApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/products/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ title: "Mutated Title" }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "FORBIDDEN_PORT_MUTATION");
  } finally {
    server.close();
  }
});

test("4. User Port: DELETE /api/products/:id is BLOCKED with 403 Forbidden", async () => {
  const { server, port } = await listenEphemeral(userApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/products/1`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "FORBIDDEN_PORT_MUTATION");
  } finally {
    server.close();
  }
});

test("5. User Port: POST /api/products/bulk-import is BLOCKED with 403 Forbidden", async () => {
  const { server, port } = await listenEphemeral(userApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/products/bulk-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ products: [] }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "FORBIDDEN_PORT_MUTATION");
  } finally {
    server.close();
  }
});

test("6. Shared Database Synchronization: Product edited on Admin Port is immediately visible on User Port", async () => {
  const userInstance = await listenEphemeral(userApp);
  const adminInstance = await listenEphemeral(adminApp);

  try {
    const uniqueTitle = `Dual Port Sync Test ${Date.now()}`;
    const uniqueSku = `TEST-DUAL-${Date.now()}`;

    // 1. Create product via Admin Port
    const createRes = await fetch(`http://localhost:${adminInstance.port}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: uniqueTitle,
        sku: uniqueSku,
        price: 1499,
        originalPrice: 1499,
        category: "casual",
        description: "Testing dual-port shared database synchronization",
      }),
    });

    assert.equal(createRes.status, 201);
    const createdData = await createRes.json();
    assert.equal(createdData.success, true);
    const createdId = createdData.product.id;

    // 2. Fetch the created product via User Port (Port 5000)
    const userFetchRes = await fetch(`http://localhost:${userInstance.port}/api/products/${createdId}`);
    assert.equal(userFetchRes.status, 200);
    const fetchedData = await userFetchRes.json();
    assert.equal(fetchedData.success, true);
    assert.equal(fetchedData.product.title, uniqueTitle);
    assert.equal(fetchedData.product.sku, uniqueSku);

    // 3. Clean up by deleting via Admin Port
    const deleteRes = await fetch(`http://localhost:${adminInstance.port}/api/products/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(deleteRes.status, 200);

    // 4. Verify User Port now returns 404 for the deleted product
    const postDeleteRes = await fetch(`http://localhost:${userInstance.port}/api/products/${createdId}`);
    assert.equal(postDeleteRes.status, 404);
  } finally {
    userInstance.server.close();
    adminInstance.server.close();
  }
});
