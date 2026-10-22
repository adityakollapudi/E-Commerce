import { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "../Reviews/StarRating";
import { useWishlist } from "../../../context/WishlistContext";

const CategoryProduct = ({
  id,
  title,
  price,
  originalPrice,
  discountPercent,
  category,
  image,
  img,
  images,
  rating,
  brand,
  colors,
  sizes,
  isNew,
}) => {
  const { isInWishlist, toggleWishlist, addToCart } = useWishlist();
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    image ||
    img ||
    (Array.isArray(images) && images[0]) ||
    "/introImageCompressed.jfif";

  const secondaryImage =
    Array.isArray(images) && images.length > 1 ? images[1] : primaryImage;

  const numPrice = Number(price);
  const ratingValue = rating?.rate || (typeof rating === "number" ? rating : 4.8);
  const reviewCount = rating?.count || 84;
  const isWishlisted = isInWishlist(id);

  // Available sizes or defaults
  const availableSizes =
    Array.isArray(sizes) && sizes.length > 0 ? sizes : ["Standard"];

  const productData = {
    id,
    title,
    price: numPrice,
    originalPrice,
    discountPercent,
    category,
    image: primaryImage,
    rating,
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productData);
  };

  const handleQuickAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has multiple sizes, open the size selection interface
    if (availableSizes.length > 1) {
      setShowSizePicker(true);
    } else {
      // Direct add for single size
      if (addToCart) {
        addToCart(productData, 1, availableSizes[0] || "Standard");
      }
    }
  };

  const handleSelectSize = (e, size) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart) {
      addToCart(productData, 1, size);
    }
    setShowSizePicker(false);
  };

  return (
    <article
      className="product-card-luxury"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizePicker(false);
      }}
    >
      <Link
        to={`/products/${encodeURIComponent(category || "casual")}/${id}`}
        className="product-link"
      >
        <div className="product-img-container">
          {/* Primary & Alternate Image for gentle hover reveal */}
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={title}
            loading="lazy"
            className="items-line-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/introImageCompressed.jfif";
            }}
          />

          {/* Badges: New Arrival / Sale */}
          <div className="product-card-badges">
            {isNew && <span className="product-new-badge">New</span>}
            {discountPercent > 0 && (
              <span className="product-discount-badge">-{discountPercent}%</span>
            )}
          </div>

          {/* Interactive Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
          </button>

          {/* Inline Size Picker Interface (appears when Quick Add requires size selection) */}
          {showSizePicker ? (
            <div
              className="product-quick-size-selector"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="size-selector-header">
                <span className="size-selector-title">Select Size</span>
                <button
                  type="button"
                  className="size-selector-close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSizePicker(false);
                  }}
                  aria-label="Close size selector"
                >
                  ✕
                </button>
              </div>
              <div className="size-selector-buttons">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className="size-choice-btn"
                    onClick={(e) => handleSelectSize(e, sz)}
                    title={`Add size ${sz} to cart`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Quick Add Button */
            <button
              type="button"
              onClick={handleQuickAddClick}
              className="product-quick-add-btn"
              aria-label={`Quick add ${title} to bag`}
              title="Quick add to bag"
            >
              <i className="fa-solid fa-bag-shopping"></i> Quick Add
            </button>
          )}
        </div>

        <div className="product-card-body">
          {brand && <span className="product-card-brand">{brand}</span>}
          <h3 className="category-product-title">{title}</h3>

          {/* Color variant swatches if available */}
          {Array.isArray(colors) && colors.length > 0 && (
            <div className="product-color-swatches" aria-label="Available colors">
              {colors.slice(0, 4).map((c, i) => {
                const hexVal = typeof c === "string" ? c : c.hex || "#333333";
                const colorName = typeof c === "string" ? c : c.name || `Color ${i + 1}`;
                return (
                  <span
                    key={i}
                    className="color-swatch-dot"
                    style={{ backgroundColor: hexVal }}
                    title={colorName}
                  />
                );
              })}
              {colors.length > 4 && (
                <span className="color-swatch-more">+{colors.length - 4}</span>
              )}
            </div>
          )}

          <div className="product-card-rating">
            <StarRating rating={ratingValue} />
            <span className="product-card-reviews-count">({reviewCount})</span>
          </div>

          <div className="product-price-row">
            <span className="category-product-price">₹{numPrice.toFixed(2)}</span>
            {originalPrice && Number(originalPrice) > numPrice && (
              <span className="product-original-price">
                ₹{Number(originalPrice).toFixed(2)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="product-discount-pill">-{discountPercent}%</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default CategoryProduct;
