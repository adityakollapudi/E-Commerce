import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Path from "../Products/Path";
import QuantityControls from "../Products/Product/QuantityControls";
import { capitalize } from "../Helpers/Helpers";
import { useAuth } from "../../context/AuthContext";

const Cart = ({ cart, decreaseQuantity, increaseQuantity, removeFromCart, clearCart }) => {
  const { user, token, isLoggedIn, openAuthModal } = useAuth();

  const [promoInput, setPromoInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(20); // Default 20% for demonstration
  const [promoApplied, setPromoApplied] = useState("SHOP20");
  const [promoError, setPromoError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(15);

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("form"); // "form" | "processing" | "success"
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Idempotency key per logical checkout session
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
    gstin: "",
    paymentMethod: "card",
    isGift: false,
    recipientName: "",
    senderName: user?.name || "",
    giftMessage: "",
    giftWrap: false,
    hidePricingOnSlip: false,
  });

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        senderName: prev.senderName || user.name || "",
      }));
    }
  }, [user]);

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const isFreeShipping = subtotal >= 1999 || deliveryFee === 0;
  const effectiveDeliveryFee = isFreeShipping ? 0 : 199;
  const discountAmount = (subtotal * discountPercent) / 100;
  const giftWrapFee = formData.giftWrap ? 99 : 0;
  const total = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? effectiveDeliveryFee : 0) + giftWrapFee);

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
        if (data.discountPercent !== undefined) setDiscountPercent(data.discountPercent);
        if (data.freeShipping) setDeliveryFee(0);
        setPromoApplied(data.code);
        setPromoInput("");
        return;
      }
      setPromoError(data.message || "Invalid coupon code.");
    } catch (err) {
      setPromoError("Failed to reach coupon validation service. Please try again.");
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenCheckout = () => {
    setCheckoutError("");
    setCheckoutStep("form");
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 1. Guard: Authentication check
    if (!token) {
      setCheckoutError("Please sign in or create an account to complete your order.");
      openAuthModal("user");
      return;
    }

    // 2. Guard: Empty cart
    if (!cart || cart.length === 0) {
      setCheckoutError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError("");
    setCheckoutStep("processing");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName.trim(),
            email: (formData.email || user?.email || "").trim(),
            phone: formData.phone.trim(),
            company: formData.company.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            gstin: formData.gstin.trim(),
          },
          gifting: {
            isGift: Boolean(formData.isGift),
            recipientName: formData.recipientName.trim(),
            senderName: formData.senderName.trim(),
            giftMessage: formData.giftMessage.trim(),
            giftWrap: Boolean(formData.giftWrap),
            hidePricingOnSlip: Boolean(formData.hidePricingOnSlip),
          },
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            size: item.size,
            selectedColor: item.selectedColor,
            selectedBranding: item.selectedBranding,
            customLogoText: item.customLogoText,
          })),
          promoCode: promoApplied || null,
          paymentMethod: formData.paymentMethod,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(
          "Received an unexpected, non-JSON response from the server. Please try again."
        );
      }

      // Check for backend failure (validation error, 401, 404, 500, etc.)
      if (!response.ok || !data?.success || !data?.order?.orderId) {
        const errorMsg =
          data?.message ||
          `Order placement failed with status ${response.status}. Please check your details and try again.`;
        throw new Error(errorMsg);
      }

      // ONLY on verified backend success:
      setOrderData(data.order);
      setCheckoutStep("success");
      setIsCheckoutOpen(false); // Close modal to unveil main confirmed view

      if (clearCart) {
        clearCart();
      }

      // Refresh idempotency key for future checkouts
      setIdempotencyKey(
        `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      );
    } catch (err) {
      // PRESERVE CART, PRESERVE FORM DATA, SHOW ERROR, ALLOW SAFE RETRY
      setCheckoutError(
        err.message ||
          "Could not complete your order. Your cart items have been preserved. Please try again."
      );
      setCheckoutStep("form");
    } finally {
      setIsSubmitting(false);
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

              {/* Complimentary Shipping Progress Banner */}
              {subtotal < 1999 ? (
                <div className="shipping-progress-banner">
                  <p className="shipping-progress-text">
                    Add <strong>₹{(1999 - subtotal).toFixed(2)}</strong> more to qualify for <strong>Complimentary Shipping</strong>!
                  </p>
                  <div className="shipping-progress-track">
                    <div
                      className="shipping-progress-fill"
                      style={{ width: `${Math.min(100, (subtotal / 1999) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="shipping-free-unlocked">
                  <i className="fa-solid fa-truck-fast"></i> You have unlocked <strong>Complimentary Shipping</strong>!
                </div>
              )}

              <div className="order-breakdown">
                <div className="order-layout">
                  <p className="text--gray text--marginless">Subtotal</p>
                  <p className="text--bold text--marginless">₹{subtotal.toFixed(2)}</p>
                </div>
                <div className="order-layout">
                  <p className="text--gray text--marginless">
                    Discount ({discountPercent}%)
                  </p>
                  <p className="text--bold text--marginless" style={{ color: "var(--accent-terracotta, #b65c45)" }}>
                    -₹{discountAmount.toFixed(2)}
                  </p>
                </div>
                <div className="order-layout">
                  <p className="text--gray text--marginless">Delivery Fee</p>
                  <p className="text--bold text--marginless">
                    {effectiveDeliveryFee === 0 ? "Complimentary (Free)" : `₹${effectiveDeliveryFee.toFixed(2)}`}
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
                onClick={handleOpenCheckout}
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
        /* Verified Backend Order Confirmed View */
        <main className="cart-page-container container order-success-page">
          <div className="order-success-card">
            <div className="success-icon-badge">
              <i className="fa-solid fa-check"></i>
            </div>
            <h1 className="title--lg">THANK YOU FOR YOUR ORDER!</h1>
            <p className="order-subtitle">
              Your order <strong>{orderData.orderId || orderData.orderNumber}</strong> has been confirmed.
            </p>
            <p className="text--gray">
              Estimated delivery by <strong>{orderData.estimatedDelivery || orderData.deliveryDate}</strong> to{" "}
              {orderData.customer?.address}, {orderData.customer?.city}.
            </p>

            <div className="order-items-receipt">
              <h3>Items Purchased ({orderData.items?.length || 0})</h3>
              {orderData.items?.map((it, idx) => (
                <div key={it.idWithSize || `${it.id}-${it.size || idx}`} className="receipt-row">
                  <span>
                    {it.quantity}x {it.title} ({String(it.size || "M").toUpperCase()})
                  </span>
                  <span>
                    ₹{Number(it.lineTotal || Number(it.price) * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <hr />
              <div className="receipt-row total">
                <span>Total Paid</span>
                <span>
                  ₹{Number(orderData.pricing?.total ?? orderData.total ?? 0).toFixed(2)}
                </span>
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
            <h1 className="title--lg empty-cart-title">Your shopping bag is empty</h1>
            <p className="empty-cart-desc">
              Your bag is waiting to be filled with handcrafted wardrobe essentials and signature pieces.
            </p>
            <Link to="/products" className="btn-luxury btn-primary">
              Explore Curated Collection →
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
                onClick={() => {
                  if (!isSubmitting) {
                    setIsCheckoutOpen(false);
                    setCheckoutStep("form");
                  }
                }}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            {/* Authentication Notice if customer is not logged in */}
            {!isLoggedIn && (
              <div className="checkout-auth-banner">
                <div className="checkout-auth-banner-text">
                  <i className="fa-solid fa-user-lock"></i>
                  <span>
                    You are not signed in. Please sign in to securely submit your order.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal("user")}
                  className="btn-pill btn-black checkout-auth-btn"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Error Banner on submission/validation error */}
            {checkoutError && (
              <div className="checkout-error-banner" role="alert">
                <i className="fa-solid fa-circle-exclamation error-icon"></i>
                <div className="error-message-text">{checkoutError}</div>
              </div>
            )}

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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone (for delivery courier)</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleFormChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Company / Organization (Optional)</label>
                    <input
                      type="text"
                      name="company"
                      placeholder="e.g. Acme Corporation"
                      value={formData.company}
                      onChange={handleFormChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>GSTIN for 18% B2B Tax Credit (Optional)</label>
                    <input
                      type="text"
                      name="gstin"
                      placeholder="e.g. 36AABCU9603R1ZM"
                      value={formData.gstin}
                      onChange={handleFormChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Gifting & Personalization Card */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", margin: "16px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#0d3b2e", cursor: "pointer", fontSize: "14px" }}>
                    <input
                      type="checkbox"
                      name="isGift"
                      checked={formData.isGift}
                      onChange={(e) => setFormData({ ...formData, isGift: e.target.checked })}
                      disabled={isSubmitting}
                    />
                    <span>🎁 This order is a gift for a client, employee, or loved one</span>
                  </label>

                  {formData.isGift && (
                    <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>To (Recipient Name)</label>
                          <input
                            type="text"
                            name="recipientName"
                            placeholder="Recipient's Name"
                            value={formData.recipientName}
                            onChange={handleFormChange}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>From (Your / Company Name)</label>
                          <input
                            type="text"
                            name="senderName"
                            placeholder="Your Name"
                            value={formData.senderName}
                            onChange={handleFormChange}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "4px" }}>Personal Gift Message Card</label>
                        <textarea
                          name="giftMessage"
                          rows={2}
                          placeholder="e.g. Wishing you continued wellness, success, and joy!"
                          value={formData.giftMessage}
                          onChange={handleFormChange}
                          style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            name="giftWrap"
                            checked={formData.giftWrap}
                            onChange={(e) => setFormData({ ...formData, giftWrap: e.target.checked })}
                          />
                          <span>🎀 Add Premium Luxury Gift Wrapping (+₹99)</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            name="hidePricingOnSlip"
                            checked={formData.hidePricingOnSlip}
                            onChange={(e) => setFormData({ ...formData, hidePricingOnSlip: e.target.checked })}
                          />
                          <span>🔒 Hide item prices on delivery package slip</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="payment-method-section">
                  <label className="section-label">Payment Method</label>
                  <div className="payment-options">
                    <label
                      className={`payment-pill ${
                        formData.paymentMethod === "card" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                      />
                      <i className="fa-regular fa-credit-card"></i> Card
                    </label>

                    <label
                      className={`payment-pill ${
                        formData.paymentMethod === "cod" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                      />
                      <i className="fa-solid fa-truck-fast"></i> Cash on Delivery
                    </label>

                    <label
                      className={`payment-pill ${
                        formData.paymentMethod === "upi" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === "upi"}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                      />
                      <i className="fa-solid fa-qrcode"></i> UPI / Pay
                    </label>
                  </div>
                </div>

                <div className="checkout-summary-bar">
                  <span>Total Due:</span>
                  <strong className="summary-total">₹{total.toFixed(2)}</strong>
                </div>

                <div className="checkout-demo-notice">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Test Mode Demonstration: This order is verified and recorded on the server database. No live payment gateway charge will occur.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-pill btn-black btn-pay-now ${
                    isSubmitting ? "btn-submitting" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="button-spinner"></span>
                      Securing Order...
                    </>
                  ) : (
                    `Complete Order (₹${total.toFixed(2)})`
                  )}
                </button>
              </form>
            )}

            {checkoutStep === "processing" && (
              <div className="checkout-processing-state">
                <div className="spinner"></div>
                <h3 className="title--sm">Securing your order...</h3>
                <p className="text--gray">
                  Contacting backend server and recording your order.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
