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
            <Link to="/" className="footer-brand-logo" aria-label="Giftingwellness Home">
              <img
                src="/giftingwellness-logo.png"
                alt="Giftingwellness Logo"
                className="footer-brand-img"
              />
              <div className="footer-brand-text-block">
                <span className="logo-wordmark">Giftingwellness</span>
                <span className="logo-subtitle">— Corporate Gifting Solutions —</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Founded by Ravi Kinnera in 2019 in Hyderabad, Giftingwellness is a premier corporate gifting solutions company. Thoughtfully chosen. Meaningfully delivered.
            </p>
            <div className="footer-contact-snippet">
              <p>
                <i className="fa-solid fa-phone" style={{ marginRight: "6px", color: "#b65c45" }}></i>
                {contactInfo.phonePrimary}
              </p>
              <p>
                <i className="fa-solid fa-envelope" style={{ marginRight: "6px", color: "#b65c45" }}></i>
                {contactInfo.emailBulk}
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
                <Link to="/about">About Gifting Wellness</Link>
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
            © {new Date().getFullYear()} GIFTING WELLNESS. All rights reserved. Corporate Gifting Solutions. Thoughtfully Chosen. Meaningfully Delivered.
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
