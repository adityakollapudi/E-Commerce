import { Link } from "react-router-dom";
import RangeSlider from "react-range-slider-input";
import SizeSelector from "./SizeSelector";

const CATEGORIES_LIST = [
  { id: "all", label: "All Products", link: "/products", icon: "fa-solid fa-border-all" },
  { id: "apparels", label: "Apparels & Clothing", link: "/products?category=apparels", icon: "fa-solid fa-shirt", isClothing: true },
  { id: "bottles", label: "Bottles & Flasks", link: "/products?category=bottles", icon: "fa-solid fa-bottle-water" },
  { id: "mugs", label: "Mugs & Tumblers", link: "/products?category=mugs", icon: "fa-solid fa-mug-hot" },
  { id: "bags", label: "Bags & Luggage", link: "/products?category=bags", icon: "fa-solid fa-briefcase" },
  { id: "pen", label: "Pens & Executive Writing", link: "/products?category=pen", icon: "fa-solid fa-pen-nib" },
  { id: "diary-notebooks", label: "Diaries & Notebooks", link: "/products?category=diary-notebooks", icon: "fa-solid fa-book-bookmark" },
  { id: "key-chains", label: "Key Chains", link: "/products?category=key-chains", icon: "fa-solid fa-key" },
  { id: "electrical-gadgets", label: "Electrical Gadgets", link: "/products?category=electrical-gadgets", icon: "fa-solid fa-bolt-lightning" },
  { id: "home-applications", label: "Home Applications", link: "/products?category=home-applications", icon: "fa-solid fa-house-chimney" },
  { id: "office-utilities", label: "Office Utilities", link: "/products?category=office-utilities", icon: "fa-solid fa-desktop" },
];

const CLOTHING_STYLES = ["casual", "formal", "party", "gym"];

const FiltersSidebar = ({
  handleSizeClick,
  handleFilterClick,
  isSizeActive,
  isFilterOpen,
  handlePriceEnter,
  price,
  setPrice,
  setIsFilterOpen,
  selectedStyle,
  setSelectedStyle,
  clearAllFilters,
  catalogMaxPrice = 2000,
  showSizeFilter = false,
  showDressStyle = false,
  activeCategory = "",
  appliedSize = [],
}) => {
  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFilterClick();
      setIsFilterOpen(false);
    }
  };

  const hasActiveFilters =
    Boolean(activeCategory && activeCategory !== "all") ||
    Boolean(selectedStyle) ||
    Boolean(appliedSize && appliedSize.length > 0) ||
    price.min > 0 ||
    price.max < catalogMaxPrice;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onTouchStart={() => setIsFilterOpen(false)}
        onClick={() => setIsFilterOpen(false)}
        className={`outside-hamburger-click-close ${isFilterOpen ? "opened" : ""}`}
        aria-hidden="true"
      />

      <aside className={`filters-container ${isFilterOpen ? "opened" : ""}`}>
        {/* Header */}
        <div className="filters-heading">
          <div className="filters-heading-title-group">
            <i className="fa-solid fa-sliders text--forest"></i>
            <h2>Filters</h2>
            {hasActiveFilters && (
              <span className="filters-active-tag">Active</span>
            )}
          </div>
          <div className="filters-heading-actions">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="filter-clear-all-link"
                title="Reset all filters"
              >
                Clear All
              </button>
            )}
            <button
              aria-label="Close filters"
              className="btn-modal-close filters-drawer-close"
              onClick={() => setIsFilterOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* 1. Category Filter Section */}
        <div className="filter-section filter-categories-section">
          <div className="filter-section-header">
            <h3>Categories</h3>
            <span className="filter-section-hint">Select a category</span>
          </div>
          <ul className="filter-categories-list">
            {CATEGORIES_LIST.map((cat) => {
              const isCatActive =
                (!activeCategory && cat.id === "all") ||
                (activeCategory && activeCategory.toLowerCase() === cat.id.toLowerCase()) ||
                (activeCategory && activeCategory === "drinkware" && (cat.id === "bottles" || cat.id === "mugs")) ||
                (activeCategory && (activeCategory === "men's clothing" || activeCategory === "women's clothing") && cat.id === "apparels");

              return (
                <li key={cat.id} className="filter-category-item">
                  <Link
                    to={cat.link}
                    onClick={() => setIsFilterOpen(false)}
                    className={`filter-category-link ${isCatActive ? "active" : ""}`}
                  >
                    <span className="filter-category-name">
                      <i className={`${cat.icon} filter-cat-icon`}></i>
                      {cat.label}
                    </span>
                    {isCatActive && (
                      <i className="fa-solid fa-check filter-active-indicator"></i>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 2. Sizes Filter Section - FOR CLOTHING ONLY */}
        {showSizeFilter && (
          <div className="filter-section filter-sizes-section">
            <div className="filter-section-header">
              <h3>
                <i className="fa-solid fa-shirt" style={{ marginRight: "6px" }}></i>
                Clothing Size
              </h3>
              {appliedSize && appliedSize.length > 0 && (
                <span className="filter-pill-badge">{appliedSize.length} selected</span>
              )}
            </div>
            <p className="filter-helper-note">Select size(s) for clothing & apparels:</p>
            <SizeSelector
              handleSizeClick={handleSizeClick}
              isSizeActive={isSizeActive}
              availableSizes={["XS", "S", "M", "L", "XL", "XXL"]}
            />
          </div>
        )}

        {/* 3. Dress Style Section - FOR CLOTHING ONLY */}
        {showDressStyle && (
          <div className="filter-section filter-dress-style">
            <div className="filter-section-header">
              <h3>Style</h3>
              {selectedStyle && (
                <button
                  type="button"
                  className="filter-clear-sub"
                  onClick={() => setSelectedStyle("")}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="dress-style-chips">
              {CLOTHING_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`style-chip ${selectedStyle === style ? "active" : ""}`}
                  onClick={() => {
                    setSelectedStyle(selectedStyle === style ? "" : style);
                  }}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Price Range Filter Section */}
        <div className="filter-section filter-price">
          <div className="filter-section-header">
            <h3>Price Range</h3>
            <span className="filter-price-display">
              ₹{price.min} – ₹{price.max >= catalogMaxPrice ? `${catalogMaxPrice}+` : price.max}
            </span>
          </div>

          <RangeSlider
            className="slider"
            min={0}
            max={catalogMaxPrice}
            step={25}
            rangeSlideDisabled
            value={[price.min, Math.min(price.max, catalogMaxPrice)]}
            onInput={(value) => setPrice({ min: value[0], max: value[1] })}
          />

          <div className="filter-price-num">
            <div className="price-input-wrapper">
              <span className="price-currency-label">₹</span>
              <input
                type="text"
                value={price.min}
                autoComplete="off"
                onChange={(e) => handlePriceEnter(e.target.value, price.max)}
                onKeyDown={handlePriceKeyDown}
                inputMode="numeric"
                className="filter-price-num-input"
                maxLength={6}
                placeholder="0"
                id="min-price-input"
                aria-label="Minimum price"
              />
            </div>
            <span className="price-dash">–</span>
            <div className="price-input-wrapper">
              <span className="price-currency-label">₹</span>
              <input
                type="text"
                value={price.max}
                autoComplete="off"
                onChange={(e) => handlePriceEnter(price.min, e.target.value)}
                onKeyDown={handlePriceKeyDown}
                inputMode="numeric"
                className="filter-price-num-input"
                maxLength={6}
                id="max-price-input"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        {/* Bottom Filter Action Buttons */}
        <div className="filter-buttons-row">
          <button
            className="btn-luxury btn-primary filter-apply"
            onClick={() => {
              handleFilterClick();
              setIsFilterOpen(false);
            }}
          >
            Apply Filters
          </button>
          {clearAllFilters && (
            <button
              type="button"
              className="btn-luxury btn-outline filter-reset"
              onClick={clearAllFilters}
            >
              Reset
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default FiltersSidebar;
