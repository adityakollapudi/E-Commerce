import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { userApp, adminApp } from "../src/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

const listenEphemeral = (app) => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({ server, port: server.address().port });
    });
  });
};

const closeServer = (server) => {
  if (!server) return;
  if (typeof server.closeAllConnections === "function") {
    server.closeAllConnections();
  }
  server.close();
};

const adminToken = jwt.sign(
  { id: "usr_admin_01", email: "admin@shop.co", role: "admin" },
  process.env.JWT_SECRET || "c7f92e4b8a1d035629c48b1a5e7f3d9204b68e1a3c7d5e9f2b4a8c1d3e5f7a9b",
  { expiresIn: "1h" }
);

const customerToken = jwt.sign(
  { id: "usr_user_01", email: "user@shop.co", role: "user" },
  process.env.JWT_SECRET || "c7f92e4b8a1d035629c48b1a5e7f3d9204b68e1a3c7d5e9f2b4a8c1d3e5f7a9b",
  { expiresIn: "1h" }
);

// Small 1x1 transparent PNG data URL for testing
const SAMPLE_PNG_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

test("Image Upload 1: Unauthenticated request to /api/upload is rejected with 401", async () => {
  const { server, port } = await listenEphemeral(adminApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Connection: "close" },
      body: JSON.stringify({ image: SAMPLE_PNG_BASE64 }),
    });
    assert.equal(res.status, 401);
  } finally {
    closeServer(server);
  }
});

test("Image Upload 2: Customer role is rejected from /api/upload with 403 Forbidden", async () => {
  const { server, port } = await listenEphemeral(adminApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
        Connection: "close",
      },
      body: JSON.stringify({ image: SAMPLE_PNG_BASE64 }),
    });
    assert.equal(res.status, 403);
  } finally {
    closeServer(server);
  }
});

test("Image Upload 3: Upload on User Port is blocked with 403 Forbidden", async () => {
  const { server, port } = await listenEphemeral(userApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        Connection: "close",
      },
      body: JSON.stringify({ image: SAMPLE_PNG_BASE64 }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.error, "FORBIDDEN_PORT_MUTATION");
  } finally {
    closeServer(server);
  }
});

test("Image Upload 4: Admin Port successfully uploads PNG image and serves statically on both ports", async () => {
  const { server: adminServer, port: adminPort } = await listenEphemeral(adminApp);
  const { server: userServer, port: userPort } = await listenEphemeral(userApp);

  let uploadedFileName = null;

  try {
    const uploadRes = await fetch(`http://localhost:${adminPort}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        Connection: "close",
      },
      body: JSON.stringify({
        image: SAMPLE_PNG_BASE64,
        fileName: "test-product.png",
      }),
    });

    assert.equal(uploadRes.status, 201);
    const uploadData = await uploadRes.json();
    assert.equal(uploadData.success, true);
    assert.ok(uploadData.url.startsWith("/uploads/prod-"));
    assert.ok(uploadData.url.endsWith(".png"));

    uploadedFileName = uploadData.fileName;
    const diskPath = path.join(uploadsDir, uploadedFileName);
    assert.ok(fs.existsSync(diskPath), "File should be created on disk in uploads/");

    // Verify static serving on Admin Port
    const adminStaticRes = await fetch(`http://localhost:${adminPort}${uploadData.url}`, {
      headers: { Connection: "close" },
    });
    assert.equal(adminStaticRes.status, 200);
    assert.match(adminStaticRes.headers.get("content-type"), /image/);

    // Verify static serving on User Port (Customer Storefront)
    const userStaticRes = await fetch(`http://localhost:${userPort}${uploadData.url}`, {
      headers: { Connection: "close" },
    });
    assert.equal(userStaticRes.status, 200);
    assert.match(userStaticRes.headers.get("content-type"), /image/);
  } finally {
    closeServer(adminServer);
    closeServer(userServer);

    // Clean up test file
    if (uploadedFileName) {
      const diskPath = path.join(uploadsDir, uploadedFileName);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {}
      }
    }
  }
});

test("Image Upload 5: Rejects unsupported file format with 400 Bad Request", async () => {
  const { server, port } = await listenEphemeral(adminApp);
  try {
    const res = await fetch(`http://localhost:${port}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        Connection: "close",
      },
      body: JSON.stringify({
        image: "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IK...",
        fileName: "doc.pdf",
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Unsupported image format/);
  } finally {
    closeServer(server);
  }
});

test("Image Upload 6: Product created with uploaded image sets image, img, and images coherently", async () => {
  const { server, port } = await listenEphemeral(adminApp);
  try {
    const testImage = "/uploads/prod-test-product-123.png";
    const res = await fetch(`http://localhost:${port}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        Connection: "close",
      },
      body: JSON.stringify({
        title: "Test Upload Product Image Coherence",
        price: 499,
        category: "drinkware",
        image: testImage,
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.product.image, testImage);
    assert.equal(data.product.img, testImage);
    assert.deepEqual(data.product.images, [testImage]);

    // Clean up created product
    await fetch(`http://localhost:${port}/api/products/${data.product.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}`, Connection: "close" },
    });
  } finally {
    closeServer(server);
  }
});
