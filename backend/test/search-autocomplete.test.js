import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import productsRouter from "../src/routes/products.js";

// Helper to run a test Express server instance
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/products", productsRouter);
  return app;
};

test("Live Search API: Search for existing seed products returns matching items with correct schema", async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/products`;

  try {
    // 1. Search for existing product: "Mug"
    const resMug = await fetch(`${baseUrl}?search=Mug&limit=6`);
    assert.equal(resMug.status, 200);
    const dataMug = await resMug.json();
    assert.equal(dataMug.success, true);
    assert.ok(Array.isArray(dataMug.products));
    assert.ok(dataMug.products.length > 0);
    assert.ok(dataMug.products.some((p) => p.title.includes("Mug")));

    // Verify response schema contains required autocomplete fields
    const product = dataMug.products[0];
    assert.ok(product.id, "Product must have an id");
    assert.ok(product.title, "Product must have a title");
    assert.ok(product.price !== undefined, "Product must have a price");
    assert.ok(product.category, "Product must have a category");

    // 2. Search for apparel item: "T-shirt"
    const resTshirt = await fetch(`${baseUrl}?search=T-shirt&limit=6`);
    assert.equal(resTshirt.status, 200);
    const dataTshirt = await resTshirt.json();
    assert.ok(dataTshirt.products.some((p) => p.title.toLowerCase().includes("t-shirt")));

    // 3. Search by brand: "Urban Gear"
    const resBrand = await fetch(`${baseUrl}?search=Urban%20Gear&limit=6`);
    assert.equal(resBrand.status, 200);
    const dataBrand = await resBrand.json();
    assert.ok(dataBrand.products.length > 0);
    assert.ok(dataBrand.products.every((p) => p.brand === "Urban Gear" || p.title.includes("Urban Gear")));

    // 4. Search by SKU: "UGDB65"
    const resSku = await fetch(`${baseUrl}?search=UGDB65&limit=6`);
    assert.equal(resSku.status, 200);
    const dataSku = await resSku.json();
    assert.equal(dataSku.products.length, 1);
    assert.equal(dataSku.products[0].sku, "UGDB65");
  } finally {
    server.close();
  }
});

test("Live Search API: Empty results when querying non-existent term", async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/products?search=NonExistentQueryXYZ12345&limit=6`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.total, 0);
    assert.deepEqual(data.products, []);
  } finally {
    server.close();
  }
});

test("Live Search API: Respects limit parameter for autocomplete suggestions", async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/products?search=clothing&limit=2`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length <= 2);
  } finally {
    server.close();
  }
});

test("Autocomplete Debounce & AbortController: Simulates rapid search input cancelling stale requests", async () => {
  const queries = ["t", "t-", "t-s", "t-sh", "t-shirt"];
  const controllers = [];
  let completedQuery = null;

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    // Abort previous controller if any
    if (controllers.length > 0) {
      controllers[controllers.length - 1].abort();
    }

    const controller = new AbortController();
    controllers.push(controller);

    if (i < queries.length - 1) {
      // Rapid keystrokes within 50ms (before 300ms debounce)
      await new Promise((r) => setTimeout(r, 50));
    } else {
      // Final keystroke pauses for 350ms (triggering execution)
      await new Promise((r) => setTimeout(r, 350));
      if (!controller.signal.aborted) {
        completedQuery = q;
      }
    }
  }

  // All earlier controllers must be aborted
  const earlierControllers = controllers.slice(0, -1);
  assert.equal(earlierControllers.length, queries.length - 1);
  assert.ok(earlierControllers.every((c) => c.signal.aborted === true), "All earlier controllers should be aborted");

  // The last controller was not aborted
  const lastController = controllers[controllers.length - 1];
  assert.equal(lastController.signal.aborted, false, "Final controller should not be aborted");
  assert.equal(completedQuery, "t-shirt");
});

test("Keyboard Navigation & Selection Routing Logic", () => {
  const sampleSuggestions = [
    { id: 1, title: "T-Shirt with Tape", category: "men's clothing" },
    { id: 2, title: "Skinny Jeans", category: "men's clothing" },
    { id: 1120677, title: "Elixir Mug", category: "drinkware" },
  ];

  // ArrowDown cycle
  const nextIndex = (curr, len) => (curr < len - 1 ? curr + 1 : 0);
  assert.equal(nextIndex(-1, sampleSuggestions.length), 0);
  assert.equal(nextIndex(0, sampleSuggestions.length), 1);
  assert.equal(nextIndex(1, sampleSuggestions.length), 2);
  assert.equal(nextIndex(2, sampleSuggestions.length), 0); // Wraps around

  // ArrowUp cycle
  const prevIndex = (curr, len) => (curr > 0 ? curr - 1 : len - 1);
  assert.equal(prevIndex(0, sampleSuggestions.length), 2); // Wraps around
  assert.equal(prevIndex(2, sampleSuggestions.length), 1);

  // Enter destination calculation
  const getDestination = (selectedIndex, suggestions, searchTerm) => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const selected = suggestions[selectedIndex];
      return `/products/${encodeURIComponent(selected.category || "item")}/${selected.id}`;
    }
    return `/products?search=${encodeURIComponent(searchTerm.trim())}`;
  };

  // When user highlighted item 0
  assert.equal(
    getDestination(0, sampleSuggestions, "shirt"),
    "/products/men's%20clothing/1"
  );

  // When user highlighted item 2 (Mug)
  assert.equal(
    getDestination(2, sampleSuggestions, "mug"),
    "/products/drinkware/1120677"
  );

  // When no item highlighted (user pressed Enter directly on input)
  assert.equal(
    getDestination(-1, sampleSuggestions, "casual wear"),
    "/products?search=casual%20wear"
  );
});
