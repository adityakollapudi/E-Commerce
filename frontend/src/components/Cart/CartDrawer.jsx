import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const FREE_SHIPPING_THRESHOLD = 1999;

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    decreaseQuantity,
    increaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  const navigate = useNavigate();

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add("body-noscroll");
    } else {
      document.body.classList.remove("body-noscroll");
    }
    return () => {
      document.body.classList.remove("body-noscroll");
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckoutClick = () => {
    closeCart();
    navigate("/cart?checkout=true");
  };

  const handleViewCartClick = () => {
    closeCart();
    navigate("/cart");
  };

  return (
    <div className="cart-drawer-overlay" onClick={closeCart} role="dialog" aria-modal="true" aria-label="Shopping Bag Drawer">
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <h2 className="cart-drawer-title">Shopping Bag</h2>
            <span className="cart-drawer-badge">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="cart-drawer-header-actions">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="cart-drawer-clear-btn"
                title="Clear shopping bag"
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              className="cart-drawer-close-btn"
              aria-label="Close shopping bag"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="cart-drawer-shipping-meter">
          <div className="shipping-meter-text">
            {amountNeededForFreeShipping === 0 ? (
              <span className="shipping-unlocked">
                <i className="fa-solid fa-circle-check"></i> You've unlocked <strong>FREE Standard Shipping</strong>!
              </span>
            ) : (
              <span>
                Add <strong className="shipping-highlight">₹{amountNeededForFreeShipping.toFixed(2)}</strong> more for <strong>FREE Delivery</strong>
              </span>
            )}
          </div>
          <div className="shipping-meter-bar" role="progressbar" aria-valuenow={freeShippingProgress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`shipping-meter-fill ${freeShippingProgress >= 100 ? "unlocked" : ""}`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        {cart.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-icon">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <h3 className="cart-drawer-empty-title">Your shopping bag is empty</h3>
            <p className="cart-drawer-empty-text">
              Browse our curated gift hampers, premium drinkware, apparel, and corporate collections.
            </p>
            <Link
              to="/products"
              onClick={closeCart}
              className="btn-luxury btn-primary cart-drawer-explore-btn"
            >
              Explore Products →
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items-list">
              {cart.map((item) => {
                const numPrice = Number(item.price) || 0;
                const lineTotal = numPrice * (item.quantity || 1);
                const hasCustomSize = item.size && item.size !== "Standard" && item.size !== "One Size";

                return (
                  <article key={item.idWithSize} className="cart-drawer-item">
                    <Link
                      to={`/products/${encodeURIComponent(item.category || "casual")}/${item.id}`}
                      onClick={closeCart}
                      className="cart-drawer-item-img-link"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="cart-drawer-item-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/introImageCompressed.jfif";
                        }}
                      />
                    </Link>

                    <div className="cart-drawer-item-body">
                      <div className="cart-drawer-item-top">
                        <Link
                          to={`/products/${encodeURIComponent(item.category || "casual")}/${item.id}`}
                          onClick={closeCart}
                          className="cart-drawer-item-title"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.idWithSize)}
                          className="cart-drawer-item-remove"
                          title="Remove item"
                          aria-label={`Remove ${item.title}`}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>

                      <div className="cart-drawer-item-meta">
                        {hasCustomSize && (
                          <span className="cart-meta-chip size-chip">
                            Size: <strong>{item.size}</strong>
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="cart-meta-chip color-chip">
                            Color: <strong>{item.selectedColor}</strong>
                          </span>
                        )}
                      </div>

                      <div className="cart-drawer-item-footer">
                        <div className="cart-drawer-qty-stepper">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item)}
                            className="qty-btn"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item)}
                            className="qty-btn"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-drawer-item-prices">
                          <span className="cart-drawer-line-total">₹{lineTotal.toFixed(2)}</span>
                          {item.quantity > 1 && (
                            <span className="cart-drawer-unit-price">
                              (₹{numPrice.toFixed(2)} ea)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Footer Summary & CTAs */}
            <div className="cart-drawer-footer">
              <div className="cart-drawer-summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toFixed(2)}</span>
              </div>
              <p className="cart-drawer-tax-note">
                <i className="fa-solid fa-shield-halved"></i> 18% GST B2B invoice available. Shipping calculated at checkout.
              </p>

              <div className="cart-drawer-actions">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="btn-luxury btn-primary cart-drawer-checkout-btn"
                >
                  <i className="fa-solid fa-lock" style={{ fontSize: "12px", marginRight: "6px" }}></i>
                  Checkout • ₹{subtotal.toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={handleViewCartClick}
                  className="btn-luxury btn-outline cart-drawer-view-btn"
                >
                  View Shopping Bag & Apply Coupons
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
