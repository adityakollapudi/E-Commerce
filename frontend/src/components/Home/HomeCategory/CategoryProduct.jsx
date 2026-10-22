import { Link } from "react-router-dom";
import StarRating from "../Reviews/StarRating";
import { useWishlist } from "../../../context/WishlistContext";

const CategoryProduct = ({
  title,
  price,
  originalPrice,
  discountPercent,
  category,
  image,
  img,
  images,
  rating,
  id,
  brand,
}) => {
  const { isInWishlist, toggleWishlist, addToCart } = useWishlist();

  const displayImage =
    image ||
    img ||
    (Array.isArray(images) && images[0]) ||
    "/introImageCompressed.jfif";
  const numPrice = Number(price);
  const ratingValue = rating?.rate || (typeof rating === "number" ? rating : 4.8);
  const reviewCount = rating?.count || 84;
  const isWishlisted = isInWishlist(id);

  const productData = {
    id,
    title,
    price,
    originalPrice,
    discountPercent,
    category,
    image: displayImage,
    rating,
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productData);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCart) {
      addToCart(productData, 1, "M");
    }
  };

  return (
    <article className="product-card-luxury">
      <Link
        to={`/products/${encodeURIComponent(category || "casual")}/${id}`}
        className="product-link"
      >
        <div className="product-img-container">
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
            className="items-line-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/introImageCompressed.jfif";
            }}
          />

          {discountPercent > 0 && (
            <span className="product-discount-badge">-{discountPercent}%</span>
          )}

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

          {/* Quick Add Overlay Button on Hover */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="product-quick-add-btn"
            aria-label="Quick add to bag"
            title="Quick add to bag"
          >
            <i className="fa-solid fa-bag-shopping"></i> Quick Add
          </button>
        </div>

        <div className="product-card-body">
          {brand && <span className="product-card-brand">{brand}</span>}
          <h3 className="category-product-title">{title}</h3>

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
