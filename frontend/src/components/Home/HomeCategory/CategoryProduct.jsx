import { Link } from "react-router-dom";
import StarRating from "../Reviews/StarRating";

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
}) => {
  const displayImage =
    image ||
    img ||
    (Array.isArray(images) && images[0]) ||
    "/introImageCompressed.jfif";
  const numPrice = Number(price);
  const ratingValue = rating?.rate || (typeof rating === "number" ? rating : 4.5);

  return (
    <Link to={`/products/${encodeURIComponent(category || "casual")}/${id}`} className="product-link">
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
      </div>
      <h3 className="title--sm category-product-title">{title}</h3>
      <div className="product-card-rating">
        <StarRating rating={ratingValue} />
      </div>
      <div className="product-price-row">
        <p className="category-product-price text--bold text">₹{numPrice.toFixed(2)}</p>
        {originalPrice && Number(originalPrice) > numPrice && (
          <span className="product-original-price">
            ₹{Number(originalPrice).toFixed(2)}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="product-discount-pill">-{discountPercent}%</span>
        )}
      </div>
    </Link>
  );
};

export default CategoryProduct;
