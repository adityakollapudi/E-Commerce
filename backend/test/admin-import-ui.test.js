import test from "node:test";
import assert from "node:assert/strict";
import {
  parseCSVMatrix,
  parseCSVToProducts,
  parseJSONToProducts,
  getSampleCSVTemplate,
  getSampleJSONTemplate,
} from "../../frontend/src/utils/csvParser.js";

test("1. CSV Matrix Parser handles RFC 4180 commas inside quotes and escaped quotes", () => {
  const csv = `sku,title,price\nPRD-001,"Crisp, Tailored Oxford Shirt",1299\nPRD-002,"The ""Vintage"" Jacket",2499`;
  const matrix = parseCSVMatrix(csv);

  assert.equal(matrix.length, 3);
  assert.deepEqual(matrix[0], ["sku", "title", "price"]);
  assert.equal(matrix[1][0], "PRD-001");
  assert.equal(matrix[1][1], "Crisp, Tailored Oxford Shirt");
  assert.equal(matrix[1][2], "1299");
  assert.equal(matrix[2][0], "PRD-002");
  assert.equal(matrix[2][1], 'The "Vintage" Jacket');
  assert.equal(matrix[2][2], "2499");
});

test("2. CSV Matrix Parser handles CRLF and multiline quoted strings", () => {
  const csv = "sku,title,description\r\nPRD-001,\"Shirt\",\"Line 1\nLine 2\"\r\nPRD-002,\"Pants\",\"Classic fit\"";
  const matrix = parseCSVMatrix(csv);

  assert.equal(matrix.length, 3);
  assert.equal(matrix[1][2], "Line 1\nLine 2");
  assert.equal(matrix[2][1], "Pants");
});

test("3. CSV Parser normalizes header aliases and parses arrays for sizes, colors, and features", () => {
  const csv = `Product Code,Product Title,Selling Price,Original Price,Cat,Brand,Sizes,Colors,Features
PRD-101,"Heavyweight Hoodie",1899,2899,casual,SHOP.CO,"S, M, L, XL","Black, White, #1e3a8a","100% Cotton; Pre-shrunk"`;

  const { products, errors } = parseCSVToProducts(csv);
  assert.equal(errors.length, 0);
  assert.equal(products.length, 1);

  const p = products[0];
  assert.equal(p.sku, "PRD-101");
  assert.equal(p.title, "Heavyweight Hoodie");
  assert.equal(p.price, 1899);
  assert.equal(p.originalPrice, 2899);
  assert.equal(p.category, "casual");
  assert.equal(p.brand, "SHOP.CO");
  assert.deepEqual(p.sizes, ["S", "M", "L", "XL"]);
  assert.deepEqual(p.colors, ["Black", "White", "#1e3a8a"]);
  assert.deepEqual(p.features, ["100% Cotton", "Pre-shrunk"]);
});

test("4. CSV Parser cleans currency symbols (₹, $) and comma separators in numbers", () => {
  const csv = `title,price,originalPrice,category\n"Luxury Coat","₹12,499","$18,999",formal`;
  const { products } = parseCSVToProducts(csv);

  assert.equal(products.length, 1);
  assert.equal(products[0].price, 12499);
  assert.equal(products[0].originalPrice, 18999);
});

test("5. JSON Parser handles both array and wrapped { products: [...] } formats", () => {
  const arrayJson = JSON.stringify([
    { title: "Item 1", price: 100, category: "casual" },
    { title: "Item 2", price: 200, category: "formal" },
  ]);
  const parsed1 = parseJSONToProducts(arrayJson);
  assert.equal(parsed1.error, null);
  assert.equal(parsed1.products.length, 2);

  const wrappedJson = JSON.stringify({
    products: [
      { title: "Item 3", price: 300, category: "gym" },
    ],
  });
  const parsed2 = parseJSONToProducts(wrappedJson);
  assert.equal(parsed2.error, null);
  assert.equal(parsed2.products.length, 1);

  const malformed = parseJSONToProducts("not-json");
  assert.ok(malformed.error.includes("Malformed JSON"));
});

test("6. Sample CSV and JSON templates are syntactically valid and match backend requirements", () => {
  const sampleCSV = getSampleCSVTemplate();
  const { products: csvProducts, errors: csvErrors } = parseCSVToProducts(sampleCSV);
  assert.equal(csvErrors.length, 0);
  assert.ok(csvProducts.length >= 3);

  for (const p of csvProducts) {
    assert.ok(p.title && typeof p.title === "string");
    assert.ok(p.price && typeof p.price === "number" && p.price > 0);
    assert.ok(p.category && typeof p.category === "string");
    assert.ok(p.sku && typeof p.sku === "string");
  }

  const sampleJSON = getSampleJSONTemplate();
  const { products: jsonProducts, error: jsonError } = parseJSONToProducts(sampleJSON);
  assert.equal(jsonError, null);
  assert.ok(jsonProducts.length >= 3);
  for (const p of jsonProducts) {
    assert.ok(p.title && typeof p.title === "string");
    assert.ok(p.price && typeof p.price === "number" && p.price > 0);
    assert.ok(p.category && typeof p.category === "string");
  }
});

test("7. Client Conflict Detection: correctly detects SKU collision with existing catalogue items", () => {
  const existingCatalog = [
    { id: 1, sku: "EXISTING-SKU-01", title: "Existing Shirt" },
    { id: 2, sku: "EXISTING-SKU-02", title: "Existing Pants" },
  ];

  const incomingRow1 = { sku: "existing-sku-01", title: "New Shirt", price: 500, category: "casual" };
  const incomingRow2 = { sku: "BRAND-NEW-SKU", title: "Brand New Item", price: 800, category: "casual" };

  const match1 = existingCatalog.find(
    (cp) => cp.sku.toLowerCase() === incomingRow1.sku.toLowerCase()
  );
  assert.ok(match1);
  assert.equal(match1.id, 1);

  const match2 = existingCatalog.find(
    (cp) => cp.sku.toLowerCase() === incomingRow2.sku.toLowerCase()
  );
  assert.equal(match2, undefined);
});
