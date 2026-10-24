import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STATUS_MAP = {
  confirmed: { label: "Confirmed", bg: "#ecfdf5", color: "#065f46", icon: "fa-circle-check" },
  in_production: { label: "In Production / Custom Branding", bg: "#fef3c7", color: "#92400e", icon: "fa-industry" },
  dispatched: { label: "Dispatched", bg: "#eff6ff", color: "#1e40af", icon: "fa-truck-fast" },
  delivered: { label: "Delivered", bg: "#f0fdf4", color: "#166534", icon: "fa-box-check" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#991b1b", icon: "fa-circle-xmark" },
  pending: { label: "Pending", bg: "#fefce8", color: "#854d0e", icon: "fa-clock" },
  pending_review: { label: "Pending Sales Review", bg: "#fefce8", color: "#854d0e", icon: "fa-clock" },
  mockup_in_progress: { label: "Mockup in Progress", bg: "#eff6ff", color: "#1e40af", icon: "fa-wand-magic-sparkles" },
  quoted: { label: "Quotation Ready", bg: "#f0fdf4", color: "#166534", icon: "fa-file-invoice" },
  accepted: { label: "Quotation Accepted", bg: "#ecfdf5", color: "#065f46", icon: "fa-check-double" },
};

const OrderHistory = () => {
  const { user, token, openAuthModal, isClerkEnabled, openClerkSignIn } = useAuth();
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'quotes' | 'enquiries'
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, quotesRes, enquiriesRes] = await Promise.allSettled([
          fetch("/api/orders", { headers }),
          fetch("/api/quote/my-quotes", { headers }),
          fetch("/api/enquiries/my-enquiries", { headers }),
        ]);

        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const data = await ordersRes.value.json();
          setOrders(data.orders || []);
        }

        if (quotesRes.status === "fulfilled" && quotesRes.value.ok) {
          const data = await quotesRes.value.json();
          setQuotes(data.quotes || []);
        }

        if (enquiriesRes.status === "fulfilled" && enquiriesRes.value.ok) {
          const data = await enquiriesRes.value.json();
          setEnquiries(data.enquiries || []);
        }
      } catch (err) {
        console.error("Failed to load customer account history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  if (!token) {
    return (
      <main className="container" style={{ padding: "80px 20px", textAlign: "center", minHeight: "60vh" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
          <i className="fa-solid fa-lock fa-3x" style={{ color: "#0d3b2e", marginBottom: "16px" }}></i>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>Sign In to View Your Account</h2>
          <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "14px" }}>
            Sign in with your Google or customer account to track orders, review corporate bulk quotes, and monitor custom branding mockups.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {isClerkEnabled ? (
              <button
                type="button"
                onClick={() => openClerkSignIn({ initialHint: "oauth_google" })}
                style={{
                  padding: "12px 24px",
                  background: "#ffffff",
                  color: "#1e293b",
                  border: "1px solid #cbd5e1",
                  borderRadius: "24px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <i className="fa-brands fa-google" style={{ color: "#4285F4" }}></i>
                Continue with Google
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => openAuthModal("user")}
              style={{
                padding: "12px 28px",
                background: "#0d3b2e",
                color: "#ffffff",
                borderRadius: "24px",
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Sign In to My Account
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "40px 20px 80px", minHeight: "70vh" }}>
      {/* Breadcrumb / Title */}
      <div style={{ marginBottom: "28px" }}>
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link> / My Account / Dashboard
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "8px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>
              Account Activity & Orders
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Signed in as <strong style={{ color: "#0d3b2e" }}>{user?.email || user?.name}</strong>
              {user?.isClerk && <span style={{ marginLeft: "8px", background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>Verified Account</span>}
            </p>
          </div>

          {/* Tab Selector */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "orders" ? "#0d3b2e" : "transparent",
                color: activeTab === "orders" ? "#ffffff" : "#475569",
                transition: "all 0.15s ease",
              }}
            >
              <i className="fa-solid fa-boxes-stacked" style={{ marginRight: "6px" }}></i>
              Orders ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quotes")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "quotes" ? "#0d3b2e" : "transparent",
                color: activeTab === "quotes" ? "#ffffff" : "#475569",
                transition: "all 0.15s ease",
              }}
            >
              <i className="fa-solid fa-comments-dollar" style={{ marginRight: "6px" }}></i>
              Corporate Quotes ({quotes.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("enquiries")}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "enquiries" ? "#0d3b2e" : "transparent",
                color: activeTab === "enquiries" ? "#ffffff" : "#475569",
                transition: "all 0.15s ease",
              }}
            >
              <i className="fa-solid fa-envelope-open-text" style={{ marginRight: "6px" }}></i>
              Enquiries ({enquiries.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ color: "#0d3b2e" }}></i>
          <p style={{ marginTop: "12px", color: "#64748b" }}>Loading account records...</p>
        </div>
      ) : activeTab === "orders" ? (
        /* ORDERS TAB */
        orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <i className="fa-solid fa-bag-shopping fa-3x" style={{ color: "#cbd5e1", marginBottom: "16px" }}></i>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px" }}>No orders placed yet</h3>
            <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "14px" }}>
              Explore our curated corporate gift sets, executive bottles, and festive wellness hampers.
            </p>
            <Link
              to="/products"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#0d3b2e",
                color: "#ffffff",
                borderRadius: "24px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              Explore Gifting Catalog →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {orders.map((ord) => {
              const statusInfo = STATUS_MAP[ord.status] || STATUS_MAP.confirmed;
              return (
                <div
                  key={ord.orderId}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Order Top Bar */}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                          Order #{ord.orderId}
                        </h2>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: "700",
                            background: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          <i className={`fa-solid ${statusInfo.icon}`}></i> {statusInfo.label}
                        </span>
                      </div>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        Ordered on {new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Total Paid</span>
                      <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0d3b2e" }}>
                        ₹{Number(ord.pricing?.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Ribbon if dispatched */}
                  {ord.tracking?.trackingNumber && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase" }}>
                          <i className="fa-solid fa-truck-fast" style={{ marginRight: "6px" }}></i>
                          Shipped via {ord.tracking.courier || "Courier Partner"}
                        </span>
                        <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                          Tracking / AWB Number: {ord.tracking.trackingNumber}
                        </p>
                      </div>
                      {ord.tracking.trackingUrl && (
                        <a
                          href={ord.tracking.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "6px 14px",
                            background: "#1d4ed8",
                            color: "#ffffff",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            textDecoration: "none",
                          }}
                        >
                          Track Shipment Live →
                        </a>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
                    {ord.items?.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          borderBottom: idx === ord.items.length - 1 ? "none" : "1px solid #f1f5f9",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {it.image && (
                            <img
                              src={it.image}
                              alt={it.title}
                              style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{it.title}</p>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              Size: {it.size || "Standard"} {it.selectedColor ? `· Color: ${it.selectedColor}` : ""} {it.selectedBranding ? `· ${it.selectedBranding.toUpperCase()} Print` : ""}
                            </span>
                            {it.customLogoText && (
                              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#0d3b2e", fontWeight: "600" }}>
                                Custom Branding: "{it.customLogoText}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>Qty: {it.quantity}</span>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0d3b2e" }}>
                            ₹{Number(it.lineTotal || it.quantity * it.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row: Delivery Address & Gifting Card */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", fontSize: "13px", color: "#475569" }}>
                    <div>
                      <span style={{ fontWeight: "700", color: "#0f172a" }}>Delivery Address:</span>
                      <p style={{ margin: "4px 0 0" }}>
                        {ord.customer?.fullName}<br />
                        {ord.customer?.address}, {ord.customer?.city} - {ord.customer?.postalCode}
                      </p>
                    </div>

                    {ord.gifting?.isGift && (
                      <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                        <span style={{ fontWeight: "700", color: "#0d3b2e" }}>🎁 Gift Note:</span>
                        {ord.gifting?.recipientName && <p style={{ margin: "2px 0" }}>To: {ord.gifting.recipientName}</p>}
                        {ord.gifting?.giftMessage && <p style={{ margin: "2px 0", fontStyle: "italic" }}>"{ord.gifting.giftMessage}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === "quotes" ? (
        /* QUOTES TAB */
        quotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <i className="fa-solid fa-comments-dollar fa-3x" style={{ color: "#cbd5e1", marginBottom: "16px" }}></i>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px" }}>No bulk quotations requested yet</h3>
            <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "14px" }}>
              Request wholesale corporate pricing and free digital mockup samples on any product from our catalog.
            </p>
            <Link
              to="/products"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#0d3b2e",
                color: "#ffffff",
                borderRadius: "24px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              Request Corporate Quote →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {quotes.map((q) => {
              const statusInfo = STATUS_MAP[q.status] || STATUS_MAP.pending_review;
              return (
                <div
                  key={q.quoteId}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px 24px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                          {q.productTitle}
                        </h3>
                        <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                          <i className={`fa-solid ${statusInfo.icon}`}></i> {statusInfo.label}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Quote #{q.quoteId} · Submitted on {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Estimated Total</span>
                      <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0d3b2e" }}>
                        {q.estimatedTotal ? `₹${Number(q.estimatedTotal).toLocaleString("en-IN")}` : "Custom Quote"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#334155" }}>
                    <div>
                      <strong>Quantity Requested:</strong> {q.quantity} units
                    </div>
                    <div>
                      <strong>Custom Branding:</strong> {q.brandingOption || "UV Digital Print"}
                    </div>
                    <div>
                      <strong>Company:</strong> {q.companyName}
                    </div>
                    <div>
                      <strong>Color:</strong> {q.selectedColor || "Default"}
                    </div>
                  </div>

                  {q.customText && (
                    <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#0d3b2e", fontWeight: "600" }}>
                      Branding Inscription: "{q.customText}"
                    </p>
                  )}

                  {q.adminNotes && (
                    <div style={{ marginTop: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", color: "#166534" }}>
                      <strong>Sales Team Note:</strong> {q.adminNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ENQUIRIES TAB */
        enquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <i className="fa-solid fa-envelope-open-text fa-3x" style={{ color: "#cbd5e1", marginBottom: "16px" }}></i>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px" }}>No general enquiries submitted yet</h3>
            <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "14px" }}>
              Looking for bespoke corporate gifting, custom curated sets, or festival lookbooks? Submit an enquiry.
            </p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "#0d3b2e",
                color: "#ffffff",
                borderRadius: "24px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              Return to Storefront →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {enquiries.map((enq) => (
              <div
                key={enq.enquiryId}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "20px 24px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                      Category: {enq.category}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Enquiry #{enq.enquiryId} · Submitted on {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <span style={{ background: "#ecfdf5", color: "#065f46", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                    Status: {enq.status || "Pending"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", color: "#334155" }}>
                  <div><strong>Quantity:</strong> {enq.quantity}</div>
                  <div><strong>Company:</strong> {enq.company || "Not specified"}</div>
                  <div><strong>Branding:</strong> {enq.customBranding}</div>
                  {enq.targetDate && <div><strong>Target Date:</strong> {enq.targetDate}</div>}
                </div>

                {enq.notes && (
                  <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#475569" }}>
                    <strong>Requirement Note:</strong> "{enq.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
};

export default OrderHistory;
