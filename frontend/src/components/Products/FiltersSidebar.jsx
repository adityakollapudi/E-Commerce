import { Link } from "react-router-dom";
import RangeSlider from "react-range-slider-input";
import SizeSelector from "./SizeSelector";

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
  showSizeFilter = true,
}) => {
  const stylesList = ["casual", "formal", "party", "gym"];

  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFilterClick();
      setIsFilterOpen(false);
    }
  };

  return (
    <>
      <div
        onTouchStart={() => setIsFilterOpen(false)}
        onClick={() => setIsFilterOpen(false)}
        className={`outside-hamburger-click-close ${
          isFilterOpen ? "opened" : ""
        }`}
      ></div>
      <div className={`filters-container ${isFilterOpen ? "opened" : ""}`}>
        <div className="filters-heading">
          <h2>Filters</h2>
          <button
            aria-label="close filter"
            className="btn-modal-close"
            onClick={() => setIsFilterOpen(false)}
          >
            <i className="fa-solid fa-xmark fa-2xl"></i>
          </button>
        </div>

        <div className="filter-section">
          <h3>Categories</h3>
          <ul className="filter-categories">
            <li>
              <Link to="/products" onClick={() => setIsFilterOpen(false)}>
                All Products
              </Link>
            </li>
            <li>
              <Link to="/products/drinkware" onClick={() => setIsFilterOpen(false)}>
                Drinkware & Gifts
              </Link>
            </li>
            <li>
              <Link to="/products/men's clothing" onClick={() => setIsFilterOpen(false)}>
                Men's Clothing
              </Link>
            </li>
            <li>
              <Link to="/products/women's clothing" onClick={() => setIsFilterOpen(false)}>
                Women's Clothing
              </Link>
            </li>
          </ul>
        </div>

        <div className="filter-section filter-dress-style">
          <h3>Dress Style</h3>
          <div className="dress-style-chips">
            {stylesList.map((style) => (
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

        <div className="filter-price">
          <h3>Price Range (₹)</h3>
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
            <label htmlFor="min-price-input" className="sr-only">
              Enter Minimum Price
            </label>
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
            />
            <span className="price-dash">-</span>
            <label htmlFor="max-price-input" className="sr-only">
              Enter Maximum Price
            </label>
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
            />
          </div>
        </div>

        {showSizeFilter ? (
          <div className="filter-sizes">
            <h3>Size</h3>
            <SizeSelector
              handleSizeClick={handleSizeClick}
              isSizeActive={isSizeActive}
            />
          </div>
        ) : (
          <div className="filter-sizes filter-sizes-disabled">
            <h3>Size</h3>
            <p className="no-sizes-note text--gray text--xs">
              Sizes are not applicable for these products.
            </p>
          </div>
        )}

        <div className="filter-buttons-row">
          <button
            className="btn-pill btn-black filter-apply"
            onClick={() => {
              handleFilterClick();
              setIsFilterOpen(false);
            }}
          >
            Apply Filter
          </button>
          {clearAllFilters && (
            <button
              type="button"
              className="btn-pill btn-white filter-reset"
              onClick={clearAllFilters}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FiltersSidebar;
