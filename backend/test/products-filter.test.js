import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSize, STANDARDIZED_SIZES } from "../src/routes/products.js";
import { PRODUCTS } from "../src/data/products.js";

test("normalizeSize standardizes uppercase and lowercase size notations", () => {
  // Standard symbols
  assert.equal(normalizeSize("XS"), "XS");
  assert.equal(normalizeSize("S"), "S");
  assert.equal(normalizeSize("M"), "M");
  assert.equal(normalizeSize("L"), "L");
  assert.equal(normalizeSize("XL"), "XL");
  assert.equal(normalizeSize("XXL"), "XXL");
  assert.equal(normalizeSize("Free Size"), "Free Size");

  // Verbose lowercase words
  assert.equal(normalizeSize("small"), "S");
  assert.equal(normalizeSize("medium"), "M");
  assert.equal(normalizeSize("large"), "L");
  assert.equal(normalizeSize("x-large"), "XL");
  assert.equal(normalizeSize("xlarge"), "XL");
  assert.equal(normalizeSize("xx-large"), "XXL");
  assert.equal(normalizeSize("xxlarge"), "XXL");
  assert.equal(normalizeSize("2xl"), "XXL");
  assert.equal(normalizeSize("x-small"), "XS");
  assert.equal(normalizeSize("xsmall"), "XS");
  assert.equal(normalizeSize("extra small"), "XS");
  assert.equal(normalizeSize("extra large"), "XL");
  assert.equal(normalizeSize("free size"), "Free Size");
  assert.equal(normalizeSize("one size"), "Free Size");

  // Non-apparel capacity or descriptor preserved
  assert.equal(normalizeSize("380ml Standard"), "380ml Standard");
  assert.equal(normalizeSize("500ml"), "500ml");
  assert.equal(normalizeSize("A5 Size"), "A5 Size");

  // Edge cases
  assert.equal(normalizeSize(""), "");
  assert.equal(normalizeSize(null), "");
  assert.equal(normalizeSize(undefined), "");
  assert.equal(normalizeSize("   M   "), "M");
});

test("Size filter matches both standard abbreviations and legacy strings", () => {
  const sampleProducts = [
    { id: 1, title: "T-Shirt", category: "men's clothing", sizes: ["S", "M", "L", "XL"] },
    { id: 2, title: "Legacy Shirt", category: "men's clothing", sizes: ["small", "medium", "large"] },
    { id: 3, title: "Blazer", category: "women's clothing", sizes: ["XS", "S", "M"] },
    { id: 4, title: "Jacket", category: "men's clothing", sizes: ["M", "L", "XL", "XXL"] },
    { id: 101, title: "Ceramic Mug", category: "drinkware", sizes: ["380ml Standard"] },
    { id: 102, title: "Vacuum Flask", category: "drinkware", sizes: ["500ml"] },
    { id: 103, title: "Bamboo Pen Set", category: "accessories", sizes: ["A5 Size"] },
  ];

  const filterBySize = (items, appliedSizes) => {
    if (!appliedSizes || appliedSizes.length === 0) return items;
    const normalizedApplied = appliedSizes.map(normalizeSize);
    return items.filter(
      (p) =>
        p.sizes &&
        p.sizes.some((s) => normalizedApplied.includes(normalizeSize(s)))
    );
  };

  // Filter by 'S' should match products 1, 2 (legacy 'small' maps to 'S'), and 3
  const sResults = filterBySize(sampleProducts, ["S"]);
  assert.equal(sResults.length, 3);
  assert.deepEqual(sResults.map((p) => p.id), [1, 2, 3]);

  // Filter by 'small' should also match products 1, 2, and 3
  const smallResults = filterBySize(sampleProducts, ["small"]);
  assert.equal(smallResults.length, 3);
  assert.deepEqual(smallResults.map((p) => p.id), [1, 2, 3]);

  // Filter by 'XXL' should only match product 4
  const xxlResults = filterBySize(sampleProducts, ["XXL"]);
  assert.equal(xxlResults.length, 1);
  assert.equal(xxlResults[0].id, 4);

  // Filter by 'XS' should only match product 3
  const xsResults = filterBySize(sampleProducts, ["XS"]);
  assert.equal(xsResults.length, 1);
  assert.equal(xsResults[0].id, 3);

  // Multi-size selection: ['XS', 'XXL'] matches products 3 and 4
  const multiResults = filterBySize(sampleProducts, ["XS", "XXL"]);
  assert.equal(multiResults.length, 2);
  assert.deepEqual(multiResults.map((p) => p.id), [3, 4]);

  // Drinkware / Accessories are not matched when filtering by apparel size
  const apparelFiltered = filterBySize(sampleProducts, ["M"]);
  assert.ok(!apparelFiltered.some((p) => p.id === 101 || p.id === 102 || p.id === 103));

  // Empty size filter returns all products
  const emptyFilterResults = filterBySize(sampleProducts, []);
  assert.equal(emptyFilterResults.length, sampleProducts.length);
});

test("Price filter safely calculates dynamic catalog ceiling and preserves discoverability", () => {
  const catalog1 = [
    { id: 1, price: 120 },
    { id: 2, price: 338 },
    { id: 3, price: 499 },
  ];

  const calculateCatalogMaxPrice = (items) => {
    if (!items || items.length === 0) return 2000;
    const maxVal = Math.max(...items.map((p) => Number(p.price) || 0));
    return Math.max(2000, Math.ceil(maxVal / 100) * 100);
  };

  // Baseline ceiling should be at least 2000 even if max item is 499
  const max1 = calculateCatalogMaxPrice(catalog1);
  assert.equal(max1, 2000);

  // If catalog has an expensive product (>2000), ceiling expands
  const catalog2 = [
    ...catalog1,
    { id: 4, price: 2450 },
  ];
  const max2 = calculateCatalogMaxPrice(catalog2);
  assert.equal(max2, 2500);

  // Reset function should reset to catalogMaxPrice (2000 or higher), NEVER 500
  const resetFilters = (catMax) => {
    return { min: 0, max: catMax };
  };
  const resetPrice1 = resetFilters(max1);
  assert.equal(resetPrice1.max, 2000);
  assert.notEqual(resetPrice1.max, 500);

  const resetPrice2 = resetFilters(max2);
  assert.equal(resetPrice2.max, 2500);

  // Price predicate allows items above 2000 to remain discoverable when appliedPrice.max >= catalogMaxPrice
  const filterByPrice = (items, appliedPrice, catalogMax) => {
    return items.filter((p) => {
      const numPrice = Number(p.price);
      return (
        numPrice >= appliedPrice.min &&
        (appliedPrice.max >= catalogMax ? true : numPrice <= appliedPrice.max)
      );
    });
  };

  // When appliedPrice is at ceiling (e.g. 2000), all products remain discoverable
  const catalogWithHighPrice = [
    { id: 1, price: 120 },
    { id: 2, price: 500 },
    { id: 3, price: 2200 },
  ];
  const catMax = calculateCatalogMaxPrice(catalogWithHighPrice); // 2200
  const allDiscovered = filterByPrice(catalogWithHighPrice, { min: 0, max: catMax }, catMax);
  assert.equal(allDiscovered.length, 3);

  // When user actively tightens price max to 200, only products <= 200 match
  const constrained = filterByPrice(catalogWithHighPrice, { min: 0, max: 200 }, catMax);
  assert.equal(constrained.length, 1);
  assert.equal(constrained[0].id, 1);
});

test("Enter key handler in price input safely falls back to catalogMaxPrice", () => {
  const catalogMaxPrice = 2000;
  const handlePriceEnter = (min, max) => {
    const numMin = min === "" ? 0 : Math.max(0, Number(min) || 0);
    const numMax = max === "" ? catalogMaxPrice : Number(max) || catalogMaxPrice;
    return { min: numMin, max: numMax };
  };

  // Empty string in max falls back to catalogMaxPrice (2000), NOT 500
  const resultEmpty = handlePriceEnter("0", "");
  assert.equal(resultEmpty.max, 2000);
  assert.notEqual(resultEmpty.max, 500);

  // Valid number is respected
  const resultValid = handlePriceEnter("100", "750");
  assert.equal(resultValid.min, 100);
  assert.equal(resultValid.max, 750);
});

test("Seed products in backend PRODUCTS catalog have standardized apparel sizes and untouched non-apparel specs", () => {
  const apparelCategories = ["men's clothing", "women's clothing"];
  const nonApparelCategories = ["drinkware", "accessories"];

  PRODUCTS.forEach((product) => {
    if (apparelCategories.includes(product.category)) {
      assert.ok(Array.isArray(product.sizes), `Apparel product #${product.id} should have sizes array`);
      assert.ok(product.sizes.length > 0, `Apparel product #${product.id} sizes should not be empty`);
      // All sizes should be in STANDARDIZED_SIZES
      product.sizes.forEach((sz) => {
        assert.ok(
          STANDARDIZED_SIZES.includes(sz),
          `Apparel product #${product.id} size "${sz}" should be standardized`
        );
      });
    }

    if (nonApparelCategories.includes(product.category)) {
      // Non-apparel products should NOT have arbitrary apparel sizes
      if (product.sizes) {
        product.sizes.forEach((sz) => {
          assert.ok(
            !["XS", "S", "M", "L", "XL", "XXL"].includes(sz),
            `Non-apparel product #${product.id} should not be assigned apparel size "${sz}"`
          );
        });
      }
    }
  });
});
