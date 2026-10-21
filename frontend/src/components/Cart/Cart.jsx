import { useState } from "react";
import { Link } from "react-router-dom";
import Path from "../Products/Path";
import QuantityControls from "../Products/Product/QuantityControls";
import { capitalize } from "../Helpers/Helpers";

const Cart = ({ cart, decreaseQuantity, increaseQuantity, removeFromCart, clearCart }) => {
  const [promoInput, setPromoInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(20); // Default 20% from template
  const [promoApplied, setPromoApplied] = useState("SHOP20");
  const [promoError, setPromoError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(15);

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("form"); // "form" | "processing" | "success"
  const [orderData, setOrderData] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card",
  });

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? deliveryFee : 0));

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.discountPercent > 0) setDiscountPercent(data.discountPercent);
        if (data.freeShipping) setDeliveryFee(0);
        setPromoApplied(data.code);
        setPromoInput("");
        return;
      }
      setPromoError(data.message || "Invalid coupon code");
    } catch (err) {
      if (code === "SHOP20" || code === "WELCOME20") {
        setDiscountPercent(20);
        setPromoApplied(code);
        setPromoInput("");
      } else if (code === "SAVE30") {
        setDiscountPercent(30);
        setPromoApplied(code);
        setPromoInput("");
      } else if (code === "FREESHIP") {
        setDeliveryFee(0);
        setPromoApplied("FREESHIP");
        setPromoInput("");
      } else {
        setPromoError("Invalid coupon code. Try 'SHOP20' or 'SAVE30'");
      }
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutStep("processing");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          subtotal: subtotal.toFixed(2),
          discount: discountAmount.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          total: total.toFixed(2),
          paymentMethod: formData.paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderData({
          orderNumber: data.order.orderId,
          deliveryDate: data.order.estimatedDelivery,
          customer: data.order.customer,
          items: data.order.items,
          subtotal: data.order.pricing.subtotal,
          discount: data.order.pricing.discount,
          total: data.order.pricing.total,
        });
      } else {
        throw new Error("Failed to post order to server");
      }
    } catch (err) {
      const orderNumber = `SHOP-${Math.floor(100000 + Math.random() * 900000)}`;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);

      setOrderData({
        orderNumber,
        deliveryDate: deliveryDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        customer: formData,
        items: [...cart],
        subtotal: subtotal.toFixed(2),
        discount: discountAmount.toFixed(2),
        total: total.toFixed(2),
      });
    }

    setCheckoutStep("success");
    if (clearCart) {
      clearCart();
    }
  };

  return (
    <>
      <Path path={[{ route: "cart", link: "/cart" }]} />

      {cart.length > 0 ? (
        <main className="cart-page-container container">
          <h1 className="title--lg">YOUR CART</h1>
          <div className="cart-flex">
            {/* Products List */}
            <div className="cart-products-container">
              {cart.map((item) => (
                <div className="cart-product-container" key={item.idWithSize}>
                  <div className="cart-product-description">
                    <img
                      src={item.image || (item.images && item.images[0]) || "/casual.jpg"}
                      className="cart-product-img"
                      alt={item.title}
                      width="124"
                      height="124"
                    />
                    <div className="cart-item-details">
                      <h3 className="title--sm">{item.title}</h3>
                      <p className="text--marginless text--sm">
                        Size: <span className="text--gray">{capitalize(item.size || "M")}</span>
                      </p>
                      {item.selectedColor && (
                        <p className="text--marginless text--sm">
                          Color: <span className="text--gray">{item.selectedColor}</span>
                        </p>
                      )}
                      <p className="cart-product-price text--bold text--lg text--marginless">
                        ₹{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="cart-product-controls">
                    <button
                      onClick={() => removeFromCart(item.idWithSize)}
                      aria-label="Remove item"
                      className="btn-trash"
                    >
                      <i className="fa-solid fa-trash-can" style={{ color: "#ef4444" }}></i>
                    </button>
                    <QuantityControls
                      handleDecrease={() => decreaseQuantity(item)}
                      handleIncrease={() => increaseQuantity(item)}
                      quantity={item.quantity}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="order-container">
              <h2 className="title--sm text--bold">Order Summary</h2>
              <div className="order-breakdown">
                <div className="order-layout">
                  <p className="text--gray text--marginless">Subtotal</p>
                  <p className="text--bold text--marginless">₹{subtotal.toFixed(2)}</p>
                </div>
                <div className="order-layout">
                  <p className="text--gray text--marginless">
                    Discount ({discountPercent}%)
                  </p>
                  <p className="text--bold text--marginless" style={{ color: "#ef4444" }}>
                    -₹{discountAmount.toFixed(2)}
                  </p>
                </div>
                <div className="order-layout">
                  <p className="text--gray text--marginless">Delivery Fee</p>
                  <p className="text--bold text--marginless">
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                  </p>
                </div>
                <hr className="order-hr" />
                <div className="order-layout total-row">
                  <p className="text--lg text--bold">Total</p>
                  <p className="text--xl text--bold">₹{total.toFixed(2)}</p>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="promo-form">
                <div className="promo-input-wrapper">
                  <i className="fa-solid fa-tag tag-icon"></i>
                  <input
                    type="text"
                    placeholder="Add promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="promo-input"
                  />
                </div>
                <button type="submit" className="btn-pill btn-black btn-promo">
                  Apply
                </button>
              </form>

              {promoApplied && (
                <p className="promo-success-text">
                  ✓ Promo <strong>{promoApplied}</strong> applied!
                </p>
              )}
              {promoError && <p className="promo-error-text">{promoError}</p>}

              <button
                onClick={() => {
                  setCheckoutStep("form");
                  setIsCheckoutOpen(true);
                }}
                className="btn-pill btn-black checkout-btn"
              >
                Go to Checkout{" "}
                <span>
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </button>
            </div>
          </div>
        </main>
      ) : orderData && checkoutStep === "success" ? (
        /* Order Confirmed View */
        <main className="cart-page-container container order-success-page">
          <div className="order-success-card">
            <div className="success-icon-badge">
              <i className="fa-solid fa-check"></i>
            </div>
            <h1 className="title--lg">THANK YOU FOR YOUR ORDER!</h1>
            <p className="order-subtitle">
              Your order <strong>{orderData.orderNumber}</strong> has been confirmed.
            </p>
            <p className="text--gray">
              Estimated delivery by <strong>{orderData.deliveryDate}</strong> to{" "}
              {orderData.customer.address}, {orderData.customer.city}.
            </p>

            <div className="order-items-receipt">
              <h3>Items Purchased ({orderData.items.length})</h3>
              {orderData.items.map((it) => (
                <div key={it.idWithSize} className="receipt-row">
                  <span>
                    {it.quantity}x {it.title} ({it.size.toUpperCase()})
                  </span>
                  <span>₹{(Number(it.price) * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="receipt-row total">
                <span>Total Paid</span>
                <span>₹{orderData.total}</span>
              </div>
            </div>

            <Link to="/products" className="btn-pill btn-black btn-return-shop">
              Continue Shopping
            </Link>
          </div>
        </main>
      ) : (
        /* Empty Cart State */
        <main className="cart-page-container container empty-cart-container">
          <div className="empty-cart-card">
            <i className="fa-solid fa-bag-shopping empty-cart-icon"></i>
            <h1 className="title--lg">Your cart is empty</h1>
            <p className="text--gray">
              Looks like you haven't added anything to your cart yet. Explore our latest fashion arrivals!
            </p>
            <Link to="/products" className="btn-pill btn-black btn-empty-cart-shop">
              Start Shopping
            </Link>
          </div>
        </main>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-card">
            <div className="checkout-modal-header">
              <h2 className="title--sm">Checkout & Shipping</h2>
              <button
                type="button"
                className="checkout-modal-close"
                onClick={() => setIsCheckoutOpen(false)}
              >
                ✕
              </button>
            </div>

            {checkoutStep === "form" && (
              <form onSubmit={handlePlaceOrder} className="checkout-form">
                <div className="checkout-fields-grid">
                  <div className="form-group full-width">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={formData.fullName}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Shipping Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="123 Fashion Blvd, Apt 4B"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      placeholder="10001"
                      value={formData.postalCode}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="payment-method-section">
                  <label className="section-label">Payment Method</label>
                  <div className="payment-options">
                    <label className={`payment-pill ${formData.paymentMethod === "card" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleFormChange}
                      />
                      <i className="fa-regular fa-credit-card"></i> Card
                    </label>

                    <label className={`payment-pill ${formData.paymentMethod === "cod" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleFormChange}
                      />
                      <i className="fa-solid fa-truck-fast"></i> Cash on Delivery
                    </label>

                    <label className={`payment-pill ${formData.paymentMethod === "upi" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === "upi"}
                        onChange={handleFormChange}
                      />
                      <i className="fa-solid fa-qrcode"></i> UPI / Pay
                    </label>
                  </div>
                </div>

                <div className="checkout-summary-bar">
                  <span>Total Due:</span>
                  <strong className="summary-total">₹{total.toFixed(2)}</strong>
                </div>

                <button type="submit" className="btn-pill btn-black btn-pay-now">
                  Complete Order (₹{total.toFixed(2)})
                </button>
              </form>
            )}

            {checkoutStep === "processing" && (
              <div className="checkout-processing-state">
                <div className="spinner"></div>
                <h3 className="title--sm">Securing your order...</h3>
                <p className="text--gray">Please wait while we finalize your payment & booking.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
