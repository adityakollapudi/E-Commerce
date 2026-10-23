import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { GIFTING_CATEGORIES } from "../../data/navigationData";

const BulkEnquiryModal = ({ isOpen, onClose, initialCategory = "" }) => {
  const { user, openAuthModal } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    category: initialCategory || "Bags",
    quantity: "100 - 250 units",
    customBranding: "Yes, Custom Logo Required",
    targetDate: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
    if (initialCategory) {
      setFormData((prev) => ({ ...prev, category: initialCategory }));
    }
  }, [user, initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="bulk-enquiry-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="bulk-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>

        {!submitted ? (
          <>
            <div className="bulk-modal-header">
              <div className="bulk-modal-kicker">
                <i className="fa-solid fa-boxes-packing"></i> B2B Corporate Gifting
              </div>
              <h2 id="bulk-modal-title">Enquiry for Bulk Orders</h2>
              <p>
                Get competitive institutional volume pricing, free digital sample proofs, and dedicated GST billing for your company requirements.
              </p>

              {/* Login/Signup Quick Banner */}
              {!user ? (
                <div className="bulk-auth-notice">
                  <div className="bulk-auth-text">
                    <i className="fa-regular fa-user-circle"></i>
                    <span>Have a corporate account or want to track quotes?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal("user");
                    }}
                    className="btn-bulk-login-link"
                  >
                    Login / Sign Up →
                  </button>
                </div>
              ) : (
                <div className="bulk-auth-logged-pill">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Logged in as <strong>{user.name}</strong> ({user.email})</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="bulk-modal-form">
              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="bulk-name">Your Full Name *</label>
                  <input
                    id="bulk-name"
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bulk-company">Company / Organization *</label>
                  <input
                    id="bulk-company"
                    type="text"
                    name="company"
                    required
                    placeholder="e.g. Infosys Ltd / TechCorp"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="bulk-email">Work Email ID *</label>
                  <input
                    id="bulk-email"
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bulk-phone">Phone / WhatsApp Number *</label>
                  <input
                    id="bulk-phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="bulk-category">Primary Category of Interest *</label>
                  <select
                    id="bulk-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {GIFTING_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="Festive Gifts">Festive & Seasonal Hampers</option>
                    <option value="Branded Gifting">Branded Merchandise (Adidas, Milton, JBL...)</option>
                    <option value="Mixed Curated Hamper">Mixed Custom Hamper Box</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bulk-quantity">Estimated Order Quantity *</label>
                  <select
                    id="bulk-quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                  >
                    <option value="25 - 49 units">25 – 49 units (Sample run)</option>
                    <option value="50 - 99 units">50 – 99 units</option>
                    <option value="100 - 249 units">100 – 249 units (Most Popular)</option>
                    <option value="250 - 499 units">250 – 499 units</option>
                    <option value="500 - 999 units">500 – 999 units (Enterprise tier)</option>
                    <option value="1000+ units">1,000+ units (Maximum discount)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="bulk-branding">Custom Logo Branding?</label>
                  <select
                    id="bulk-branding"
                    name="customBranding"
                    value={formData.customBranding}
                    onChange={handleChange}
                  >
                    <option value="Yes, Screen / UV Print">Yes, Screen / Digital UV Print</option>
                    <option value="Yes, Laser Engraving">Yes, Laser Engraving</option>
                    <option value="Yes, Embroidery / Debossing">Yes, Embroidery / Debossing</option>
                    <option value="Plain / No Logo">No Branding Needed (Plain Items)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bulk-date">Target Delivery Date</label>
                  <input
                    id="bulk-date"
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bulk-notes">Specific Requirements / SKU Codes (Optional)</label>
                <textarea
                  id="bulk-notes"
                  name="notes"
                  rows="2"
                  placeholder="Mention product models, preferred colors, or delivery locations..."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="bulk-modal-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-bulk-enquiry"
                >
                  {loading ? (
                    <span>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </span>
                  ) : (
                    <span>
                      <i className="fa-solid fa-paper-plane"></i> Submit Bulk Order Request
                    </span>
                  )}
                </button>
                <span className="bulk-guarantee-note">
                  🔒 We respect your privacy. No spam. Official quotation sent in 2 hours.
                </span>
              </div>
            </form>
          </>
        ) : (
          <div className="bulk-success-view">
            <div className="bulk-success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3>Bulk Enquiry Received Successfully!</h3>
            <p className="bulk-success-desc">
              Thank you, <strong>{formData.name}</strong>. Our corporate gifting consultant has been notified and will prepare a customized proposal with volume discount pricing for <strong>{formData.company}</strong> within 2 hours.
            </p>
            <div className="bulk-summary-card">
              <div className="summary-item">
                <span>Category:</span> <strong>{formData.category}</strong>
              </div>
              <div className="summary-item">
                <span>Quantity:</span> <strong>{formData.quantity}</strong>
              </div>
              <div className="summary-item">
                <span>Branding:</span> <strong>{formData.customBranding}</strong>
              </div>
              <div className="summary-item">
                <span>Contact Email:</span> <strong>{formData.email}</strong>
              </div>
            </div>

            <div className="bulk-success-actions">
              <button
                type="button"
                onClick={handleReset}
                className="btn-submit-bulk-enquiry"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEnquiryModal;
