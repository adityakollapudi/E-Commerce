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
};

const OrderHistory = () => {
  const { user, token, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [token]);

  if (!token) {
    return (
      <main className="container" style={{ padding: "80px 20px", textAlign: "center", minHeight: "60vh" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", background: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
          <i className="fa-solid fa-lock fa-3x" style={{ color: "#0d3b2e", marginBottom: "16px" }}></i>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>Sign In to View Orders</h2>
          <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: "14px" }}>
            Please sign in to track your gift shipments, review past invoices, and monitor custom branding production.
          </p>
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
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "40px 20px 80px", minHeight: "70vh" }}>
      {/* Breadcrumb / Title */}
      <div style={{ marginBottom: "28px" }}>
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link> / My Account / Orders
        </span>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "8px 0 4px" }}>
          My Orders & Gift Shipments
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
          Track real-time shipment dispatches, digital proofs, and view detailed invoices for your gifts.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ color: "#0d3b2e" }}></i>
          <p style={{ marginTop: "12px", color: "#64748b" }}>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
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
      )}
    </main>
  );
};

export default OrderHistory;
