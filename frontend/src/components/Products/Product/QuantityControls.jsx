const QuantityControls = ({handleDecrease, handleIncrease, quantity}) => {
    return (
        <div className="btn-pill btn-size item-number-container">
        <button
          className="change-quantity"
          aria-label="Decrease quantity by 1"
          onClick={handleDecrease}
        >
          <i className="fa-solid fa-minus"></i>
        </button>
        <input
          type="number"
          className="item-number"
          value={quantity}
          readOnly
        />
        <button
          className="change-quantity"
          aria-label="Increase quantity by 1"
          onClick={handleIncrease}
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    )
}

export default QuantityControls;