import SocMediaIcons from "../Misc/SocMediaIcons";
import { Link } from "react-router-dom";
import { useSiteContent } from "../../context/SiteContentContext";

const Footer = () => {
  const { contactInfo } = useSiteContent();

  return (
    <footer className="luxury-footer" aria-label="Footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand-logo" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
              <div className="brand-logo-img-wrapper" style={{ width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.2)", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src="/gifting-wellness-logo.jpg"
                  alt="Gifting Wellness"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="logo-wordmark" style={{ fontSize: "18px", letterSpacing: "0.06em", color: "#f8fafc" }}>Gifting Wellness</span>
                <span className="logo-subtitle" style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#b65c45" }}>CORPORATE GIFTING SOLUTIONS</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Founded by Ravi Kinnera in 2019, Gifting Wellness is a new-age corporate gifting solutions company based in Hyderabad, India. Thoughtfully Chosen. Meaningfully Delivered.
            </p>
            <div className="footer-contact-snippet">
              <p>
                <i className="fa-solid fa-location-dot" style={{ marginRight: "6px", color: "#b65c45" }}></i>
                Hyderabad, Telangana, India
              </p>
              <p>
                <i className="fa-solid fa-phone" style={{ marginRight: "6px", color: "#b65c45" }}></i>
                {contactInfo?.phonePrimary || "+91 98765 43210"}
              </p>
              <p>
                <i className="fa-solid fa-envelope" style={{ marginRight: "6px", color: "#b65c45" }}></i>
                {contactInfo?.emailBulk || "corporate@giftingwellness.com"}
              </p>
            </div>
            <div className="footer-social-wrapper">
              <SocMediaIcons />
            </div>
          </div>

          {/* Core Categories Column */}
          <div className="footer-links-column">
            <h3 className="footer-column-heading">Gifting Categories</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/products?search=Bottle">Bottles & Insulated Flasks</Link>
              </li>
              <li>
                <Link to="/products?search=Mug">Ceramic & Cork Mugs</Link>
              </li>
              <li>
                <Link to="/products?search=Bag">Bags & Executive Backpacks</Link>
              </li>
              <li>
                <Link to="/products?search=Gadget">Tech & Electrical Gadgets</Link>
              </li>
              <li>
                <Link to="/products?search=Pen">Executive Pens & Stylus</Link>
              </li>
              <li>
                <Link to="/products?search=Notebook">Diaries & Organizers</Link>
              </li>
            </ul>
          </div>

          {/* Bespoke Services Column */}
          <div className="footer-links-column">
            <h3 className="footer-column-heading">Gifting Services</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/products?search=Corporate">Corporate Gifting</Link>
              </li>
              <li>
                <Link to="/products?search=Employee">Employee Joining Kits</Link>
              </li>
              <li>
                <Link to="/products?search=Return">Return Gifting for Events</Link>
              </li>
              <li>
                <Link to="/products?search=Conference">Conference & Summit Swags</Link>
              </li>
              <li>
                <Link to="/products?search=Festive">Diwali & Festive Hampers</Link>
              </li>
              <li>
                <Link to="/products?search=Branded">Branded Corporate Catalog</Link>
              </li>
            </ul>
          </div>

          {/* Corporate Support Column */}
          <div className="footer-links-column">
            <h3 className="footer-column-heading">Corporate Support</h3>
            <ul className="footer-links-list">
              <li>
                <a href="#brand-story">Why Atelier Gifting</a>
              </li>
              <li>
                <Link to="/products">Free Digital Sample Mockups</Link>
              </li>
              <li>
                <Link to="/products">B2B GST Tax Billing & Compliance</Link>
              </li>
              <li>
                <Link to="/products">Volume Tier Quotations</Link>
              </li>
              <li>
                <Link to="/products">Multi-City Doorstep Delivery</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-text">
            © {new Date().getFullYear()} Gifting Wellness. All rights reserved. Corporate Gifting Solutions — Thoughtfully Chosen. Meaningfully Delivered.
          </div>

          <div className="footer-payment-methods">
            <span className="payment-badge-text">
              <i className="fa-solid fa-shield-halved" style={{ marginRight: "6px", color: "#10b981" }}></i>
              Official GST 18% Tax Billing · Pan-India Dispatch
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
