import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminRoute from "./AdminRoute";

const PRESET_TEMPLATES = [
  {
    name: "Ceramic Coffee Mug",
    category: "drinkware",
    style: "corporate",
    brand: "Urban Gear",
    title: "Urban Gear Arctic Cork-Base Ceramic Tumbler",
    price: 389,
    originalPrice: 699,
    moq: 50,
    deliveryDays: "5–7 Days",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    description: "Vacuum insulated travel mug with splash-resistant lid and natural anti-slip cork base. Engineered for desk comfort and executive corporate gifting.",
    features: "Food grade ceramic body\nSplash-proof slider lid\nAnti-scratch natural cork base\nOfficial B2B GST invoice",
  },
  {
    name: "Heavyweight Hoodie",
    category: "men's clothing",
    style: "casual",
    brand: "SHOP.CO Originals",
    title: "Minimalist Heavyweight French Terry Hoodie",
    price: 1899,
    originalPrice: 2899,
    moq: 1,
    deliveryDays: "3–4 Days",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    description: "Crafted from 400 GSM brushed organic French Terry cotton for supreme warmth, comfort, and structured drape.",
    features: "100% Organic combed cotton\nDouble-layered hood with drawstrings\nPre-shrunk fabric to prevent sizing loss\nKangaroo front pocket",
  },
  {
    name: "Classic Oxford Shirt",
    category: "men's clothing",
    style: "formal",
    brand: "Heritage Tailors",
    title: "Tailored Crisp Oxford Cotton Button-Down Shirt",
    price: 1299,
    originalPrice: 2199,
    moq: 1,
    deliveryDays: "2–4 Days",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    description: "A timeless corporate and formal staple woven with breathable 2-ply Egyptian cotton. Precision stitched collar and mother-of-pearl finish buttons.",
    features: "100% High-thread Oxford Cotton\nReinforced button placket and collar\nWrinkle-resistant weave\nTailored modern fit",
  },
  {
    name: "Stainless Steel Flask",
    category: "drinkware",
    style: "gym",
    brand: "HydroVibe",
    title: "HydroVibe Matte Black Double-Wall Thermos 750ml",
    price: 649,
    originalPrice: 999,
    moq: 20,
    deliveryDays: "3–5 Days",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    description: "Keeps beverages ice-cold for 24 hours or piping hot for 12 hours. Sweat-free powder-coat exterior with ergonomic carrying handle.",
    features: "18/8 Pro-grade stainless steel\nDouble-wall vacuum insulation\n100% Leakproof sports cap\nBPA and Phthalate free",
  },
  {
    name: "Oversized Graphic Tee",
    category: "women's clothing",
    style: "party",
    brand: "StreetVibe",
    title: "Vintage Washed Acid Drop Oversized T-Shirt",
    price: 899,
    originalPrice: 1499,
    moq: 1,
    deliveryDays: "2–3 Days",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    description: "Relaxed streetwear boxy cut made with 240 GSM bio-washed cotton. Vintage mineral wash finish with faded typography graphic.",
    features: "240 GSM heavy combed jersey\nDrop-shoulder streetwear cut\nRibbed mock-neck collar\nHigh-density screen print",
  },
];

const AddProduct = () => {
  const { token } = useAuth();

  // Form states
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("SHOP.CO");
  const [sku, setSku] = useState(`PRD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [category, setCategory] = useState("drinkware");
  const [style, setStyle] = useState("corporate");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [moq, setMoq] = useState("1");
  const [deliveryDays, setDeliveryDays] = useState("3–5 Days");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(["S", "M", "L", "XL"]);
  const [isNew, setIsNew] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdProduct, setCreatedProduct] = useState(null);

  // Apply a preset template
  const applyTemplate = (t) => {
    setTitle(t.title);
    setBrand(t.brand);
    setCategory(t.category);
    setStyle(t.style);
    setPrice(t.price.toString());
    setOriginalPrice(t.originalPrice.toString());
    setMoq(t.moq.toString());
    setDeliveryDays(t.deliveryDays);
    setImage(t.image);
    setDescription(t.description);
    setFeatures(t.features);
    setSku(`PRD-${Math.floor(100000 + Math.random() * 900000)}`);
    setErrorMsg("");
    setCreatedProduct(null);
  };

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setCreatedProduct(null);

    if (!title.trim()) {
      setErrorMsg("Please enter a product title.");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg("Please enter a valid positive selling price.");
      return;
    }
    if (!category.trim()) {
      setErrorMsg("Please choose or specify a category.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        brand: brand.trim(),
        sku: sku.trim(),
        category: category.trim(),
        style: style.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price),
        moq: Number(moq) || 1,
        deliveryDays,
        image: image.trim(),
        images: [image.trim() || "/product-img-1.png"],
        description: description.trim(),
        features: features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        sizes: selectedSizes,
        isNew,
        isBestSeller,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create product.");
      }

      setCreatedProduct(data.product);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred while saving the product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setBrand("SHOP.CO");
    setSku(`PRD-${Math.floor(100000 + Math.random() * 900000)}`);
    setCategory("drinkware");
    setStyle("corporate");
    setPrice("");
    setOriginalPrice("");
    setMoq("1");
    setDeliveryDays("3–5 Days");
    setImage("");
    setDescription("");
    setFeatures("");
    setSelectedSizes(["S", "M", "L", "XL"]);
    setIsNew(true);
    setIsBestSeller(false);
    setCreatedProduct(null);
    setErrorMsg("");
  };

  // Compute live discount percentage
  const numPrice = Number(price) || 0;
  const numOrig = Number(originalPrice) || numPrice;
  const discountPct =
    numOrig > numPrice ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

  return (
    <AdminRoute>
      <div className="admin-page-layout">
        <AdminHeader />

        <main className="container admin-main-content">
          {/* Breadcrumb / Top Bar */}
          <div className="admin-breadcrumb-bar">
            <div>
              <h1 className="admin-page-title">
                <i className="fa-solid fa-circle-plus"></i> Add New Product to Store
              </h1>
              <p className="admin-page-desc">
                Publish a new item directly to the live catalog. It will immediately be available for shopping and filtering.
              </p>
            </div>
            <Link to="/admin" className="btn-admin-outline">
              ← Return to Catalog Table
            </Link>
          </div>

          {/* Success Banner */}
          {createdProduct && (
            <div className="admin-success-banner" role="status">
              <div className="success-icon-col">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="success-text-col">
                <h3>Product Successfully Published!</h3>
                <p>
                  <strong>{createdProduct.title}</strong> has been added to the store catalog under the <em>{createdProduct.category}</em> category.
                </p>
                <div className="success-action-btns">
                  <Link
                    to={`/products/${encodeURIComponent(createdProduct.category)}/${createdProduct.id}`}
                    className="btn-success-view"
                    target="_blank"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> View Live Product Page →
                  </Link>
                  <button type="button" className="btn-success-another" onClick={handleReset}>
                    <i className="fa-solid fa-plus"></i> Add Another Product
                  </button>
                  <Link to="/admin" className="btn-success-catalog">
                    Manage in Catalog
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="admin-error-banner" role="alert">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preset Quick Fill Templates */}
          <section className="preset-templates-section">
            <div className="presets-header">
              <span className="presets-label">
                <i className="fa-solid fa-wand-magic-sparkles"></i> 1-Click Starter Presets:
              </span>
              <span className="presets-sub">Select any sample to prefill the form automatically:</span>
            </div>
            <div className="preset-buttons-row">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-btn"
                  onClick={() => applyTemplate(tmpl)}
                >
                  <span className="preset-dot"></span>
                  {tmpl.name}
                </button>
              ))}
            </div>
          </section>

          {/* Main 2-Column Split: Form + Live Preview Card */}
          <div className="admin-split-grid">
            {/* Form Column */}
            <div className="admin-form-col">
              <form onSubmit={handleSubmit} className="admin-product-form">
                
                {/* Section 1: Basic Information */}
                <div className="admin-form-card">
                  <h2 className="admin-card-heading">
                    <i className="fa-solid fa-tag"></i> 1. Basic Product Info
                  </h2>

                  <div className="form-group">
                    <label htmlFor="prod-title">Product Title *</label>
                    <input
                      id="prod-title"
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Urban Gear Arctic Cork-Base Ceramic Tumbler"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="prod-brand">Brand / Manufacturer</label>
                      <input
                        id="prod-brand"
                        type="text"
                        className="admin-input"
                        placeholder="e.g. SHOP.CO, Urban Gear"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-sku">Model / SKU Code</label>
                      <input
                        id="prod-sku"
                        type="text"
                        className="admin-input"
                        placeholder="e.g. UGDB65"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="prod-category">Category *</label>
                      <select
                        id="prod-category"
                        className="admin-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="drinkware">Drinkware & Corporate Gifts</option>
                        <option value="men's clothing">Men's Clothing</option>
                        <option value="women's clothing">Women's Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="electronics">Electronics & Tech</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="prod-style">Dress / Occasion Style</label>
                      <select
                        id="prod-style"
                        className="admin-select"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                      >
                        <option value="corporate">Corporate Gifting</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                        <option value="party">Party</option>
                        <option value="gym">Gym & Fitness</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pricing & Inventory */}
                <div className="admin-form-card">
                  <h2 className="admin-card-heading">
                    <i className="fa-solid fa-coins"></i> 2. Pricing & Delivery
                  </h2>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label htmlFor="prod-price">Selling Price (₹) *</label>
                      <input
                        id="prod-price"
                        type="number"
                        min="1"
                        step="1"
                        className="admin-input"
                        placeholder="389"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="prod-orig-price">Original M.R.P. (₹)</label>
                      <input
                        id="prod-orig-price"
                        type="number"
                        min="1"
                        step="1"
                        className="admin-input"
                        placeholder="699"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Discount Calculated</label>
                      <div className="admin-stat-display">
                        {discountPct > 0 ? (
                          <span className="badge-discount-calc">-{discountPct}% OFF</span>
                        ) : (
                          <span className="badge-nodiscount">No Discount</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="prod-moq">Min. Order Qty (MOQ)</label>
                      <input
                        id="prod-moq"
                        type="number"
                        min="1"
                        className="admin-input"
                        placeholder="1 (or 50 for bulk)"
                        value={moq}
                        onChange={(e) => setMoq(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="prod-delivery">Estimated Delivery</label>
                      <input
                        id="prod-delivery"
                        type="text"
                        className="admin-input"
                        placeholder="e.g. 3–5 Days"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Media & Images */}
                <div className="admin-form-card">
                  <h2 className="admin-card-heading">
                    <i className="fa-solid fa-image"></i> 3. Product Media & Images
                  </h2>

                  <div className="form-group">
                    <label htmlFor="prod-image">Image URL</label>
                    <input
                      id="prod-image"
                      type="url"
                      className="admin-input"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                    <small className="form-help-text">
                      Paste a direct image URL (e.g. from Unsplash or your CDN). You can also click any of the preset cards above.
                    </small>
                  </div>
                </div>

                {/* Section 4: Details & Specifications */}
                <div className="admin-form-card">
                  <h2 className="admin-card-heading">
                    <i className="fa-solid fa-align-left"></i> 4. Description & Specifications
                  </h2>

                  <div className="form-group">
                    <label htmlFor="prod-desc">Product Overview / Description</label>
                    <textarea
                      id="prod-desc"
                      className="admin-textarea"
                      rows="3"
                      placeholder="Describe the product materials, aesthetic, and benefits..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prod-features">Key Highlights (1 feature per line)</label>
                    <textarea
                      id="prod-features"
                      className="admin-textarea"
                      rows="3"
                      placeholder="Keeps coffee/tea warm for 6 hours&#10;Food grade ceramic with natural cork&#10;Splash-resistant lid included"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Sizes */}
                  <div className="form-group">
                    <label>Available Sizes</label>
                    <div className="sizes-checkbox-row">
                      {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          className={`size-toggle-btn ${selectedSizes.includes(sz) ? "active" : ""}`}
                          onClick={() => toggleSize(sz)}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Badges / Toggles */}
                  <div className="form-grid-2">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isNew}
                        onChange={(e) => setIsNew(e.target.checked)}
                      />
                      <span>Mark as "New Arrival"</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                      />
                      <span>Mark as "Best Seller"</span>
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="form-actions-row">
                  <button
                    type="submit"
                    className="btn-admin-submit-product"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Publishing to Catalog...
                      </span>
                    ) : (
                      <span>
                        <i className="fa-solid fa-cloud-arrow-up"></i> Publish Product to Catalog
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-admin-clear"
                    onClick={handleReset}
                    disabled={submitting}
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>

            {/* Live Storefront Preview Column */}
            <div className="admin-preview-col">
              <div className="preview-sticky-card">
                <div className="preview-badge-header">
                  <span className="live-indicator-dot"></span>
                  <strong>LIVE STOREFRONT PREVIEW</strong>
                </div>
                <p className="preview-caption">
                  This is how customers will see this item in the catalog:
                </p>

                {/* Simulated Shop Product Card */}
                <div className="mock-product-card">
                  <div className="mock-img-wrapper">
                    <img
                      src={
                        image ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={title || "Product Preview"}
                      className="mock-img"
                    />
                    {discountPct > 0 && (
                      <span className="mock-discount-pill">-{discountPct}%</span>
                    )}
                    {isNew && <span className="mock-new-pill">NEW</span>}
                  </div>

                  <div className="mock-details">
                    <div className="mock-meta-row">
                      <span className="mock-brand">{brand || "SHOP.CO"}</span>
                      <span className="mock-category-pill">{category}</span>
                    </div>

                    <h3 className="mock-title">
                      {title || "Product Title Preview"}
                    </h3>

                    <div className="mock-rating">
                      <span className="stars">★★★★★</span>
                      <span className="rate-num">5.0/5</span>
                    </div>

                    <div className="mock-price-row">
                      <span className="mock-current-price">₹{price || "0"}</span>
                      {numOrig > numPrice && (
                        <span className="mock-orig-price">₹{originalPrice}</span>
                      )}
                      {Number(moq) > 1 && (
                        <span className="mock-moq-badge">MOQ: {moq} pcs</span>
                      )}
                    </div>

                    <div className="mock-delivery-row">
                      <i className="fa-solid fa-truck-fast"></i> Delivers in {deliveryDays || "3–5 Days"}
                    </div>

                    <button type="button" className="mock-btn-preview" disabled>
                      <i className="fa-solid fa-cart-shopping"></i> Add to Cart (Customer View)
                    </button>
                  </div>
                </div>

                {/* Admin Quick Tips Card */}
                <div className="admin-tips-card">
                  <h4>
                    <i className="fa-regular fa-lightbulb"></i> Admin Best Practices
                  </h4>
                  <ul>
                    <li>High-contrast product images on clean backgrounds convert 40% better.</li>
                    <li>Setting an Original M.R.P. highlights discounts to drive bulk orders.</li>
                    <li>Items published here immediately update customer search & filters.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminRoute>
  );
};

export default AddProduct;
