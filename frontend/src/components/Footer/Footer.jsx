import SocMediaIcons from "../Misc/SocMediaIcons";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <footer className="luxury-footer" aria-label="Footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand-logo">
              <span className="logo-wordmark">ATELIER</span>
              <span className="logo-subtitle">& CO.</span>
            </Link>
            <p className="footer-brand-desc">
              Purveyors of modern luxury and enduring essentials. Thoughtfully conceived,
              responsibly sourced, and made to outlive fast-trend cycles.
            </p>
            <div className="footer-social-wrapper">
              <SocMediaIcons />
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links-column">
            <h3 className="footer-column-heading">Quick Links</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/products">Shop All</Link>
              </li>
              <li>
                <Link to="/products?style=casual">Everyday Essentials</Link>
              </li>
              <li>
                <Link to="/products?style=formal">Signature Collection</Link>
              </li>
              <li>
                <Link to="/products?new=true">New Arrivals</Link>
              </li>
              <li>
                <Link to="/underconstruction">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="footer-links-column">
            <h3 className="footer-column-heading">Customer Care</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/underconstruction">Shipping & Delivery</Link>
              </li>
              <li>
                <Link to="/underconstruction">Complimentary Returns</Link>
              </li>
              <li>
                <Link to="/underconstruction">Track Your Order</Link>
              </li>
              <li>
                <Link to="/underconstruction">Garment Care Guide</Link>
              </li>
              <li>
                <Link to="/underconstruction">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div className="footer-links-column">
            <h3 className="footer-column-heading">Company & Legal</h3>
            <ul className="footer-links-list">
              <li>
                <Link to="/underconstruction">Our Craft & Mills</Link>
              </li>
              <li>
                <Link to="/underconstruction">Sustainability Manifesto</Link>
              </li>
              <li>
                <Link to="/underconstruction">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/underconstruction">Terms of Service</Link>
              </li>
              <li>
                <a href="#brand-story" className="footer-story-link">Discover Our Story</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-text">
            © {new Date().getFullYear()} ATELIER & CO. Storefront. All rights reserved. Designed for the Art of Everyday Living.
          </div>

          <div className="footer-payment-methods">
            <span className="payment-badge" title="Visa">
              <i className="fa-brands fa-cc-visa"></i> Visa
            </span>
            <span className="payment-badge" title="Mastercard">
              <i className="fa-brands fa-cc-mastercard"></i> Mastercard
            </span>
            <span className="payment-badge" title="UPI">
              <i className="fa-solid fa-qrcode"></i> UPI
            </span>
            <span className="payment-badge" title="Apple Pay">
              <i className="fa-brands fa-apple-pay"></i> Apple Pay
            </span>
            <span className="payment-badge" title="Secure SSL">
              <i className="fa-solid fa-lock"></i> 256-bit SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
