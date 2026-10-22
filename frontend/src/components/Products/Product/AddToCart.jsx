import { useState } from "react";
import QuantityControls from "./QuantityControls";
import { useWishlist } from "../../../context/WishlistContext";

const AddToCart = ({
  initialQuantity,
  item,
  addToCart,
  size,
  clearSize,
  handleSizeWarning,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [isAdded, setIsAdded] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(item?.id);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleAddClick = () => {
    if (!size || size.length < 1) {
      handleSizeWarning(true);
      return;
    }
    addToCart(item, quantity, size);
    setIsAdded(true);
    setQuantity(1);
    clearSize();
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="product-detail-cart-row">
      <div className="quantity-controls-container">
        <QuantityControls
          handleDecrease={handleDecrease}
          handleIncrease={handleIncrease}
          quantity={quantity}
        />
        <button
          onClick={handleAddClick}
          className={`btn-luxury btn-primary add-to-cart-cta ${isAdded ? "btn-added-success" : ""}`}
        >
          {isAdded ? (
            <>
              <i className="fa-solid fa-check"></i> Added to Bag!
            </>
          ) : (
            <>
              <i className="fa-solid fa-bag-shopping"></i> Add to Bag
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => toggleWishlist(item)}
        className={`btn-luxury btn-outline detail-wishlist-toggle ${isWishlisted ? "is-wishlisted" : ""}`}
        aria-label={isWishlisted ? "Saved in wishlist" : "Save to wishlist"}
      >
        <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
        <span>{isWishlisted ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
};

export default AddToCart;
