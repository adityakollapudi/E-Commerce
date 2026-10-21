import { useState } from "react";
import QuantityControls from "./QuantityControls";

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
    <div className="quantity-controls-container">
      <QuantityControls
        handleDecrease={handleDecrease}
        handleIncrease={handleIncrease}
        quantity={quantity}
      />
      <button
        onClick={handleAddClick}
        className={`btn-black btn-pill change-quantity ${isAdded ? "btn-added-success" : ""}`}
      >
        {isAdded ? (
          <>
            <i className="fa-solid fa-check" style={{ marginRight: "8px" }}></i>
            Added to Cart!
          </>
        ) : (
          "Add To Cart"
        )}
      </button>
    </div>
  );
};

export default AddToCart;
