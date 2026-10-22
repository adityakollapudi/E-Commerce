import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const HamburgerMobile = ({ mobileMenuShow, handleMouseClick }) => {
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { wishlistCount, openWishlist } = useWishlist();

  return (
    <>
      <div
        onTouchStart={handleMouseClick}
        onClick={handleMouseClick}
        className={`outside-hamburger-click-close ${mobileMenuShow ? "opened" : ""}`}
      ></div>

      <nav className={`mobile-hamburger-container ${mobileMenuShow ? "opened" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-brand">ATELIER & CO.</span>
          <button onClick={handleMouseClick} aria-label="Close menu" type="button" className="btn-modal-close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* User Account Section in Mobile Menu */}
        <div className="mobile-auth-banner">
          {user ? (
            <div className="mobile-user-profile">
              <div className="mobile-user-avatar">
                {isAdmin ? <i className="fa-solid fa-shield-halved"></i> : <i className="fa-solid fa-user"></i>}
              </div>
              <div className="mobile-user-details">
                <span className="mobile-user-name">{user.name}</span>
                <span className="mobile-user-role">{isAdmin ? "Administrator" : "Customer"}</span>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <button
                type="button"
                className="btn-mobile-login"
                onClick={() => {
                  handleMouseClick();
                  openAuthModal("user");
                }}
              >
                <i className="fa-regular fa-user"></i> Customer Sign In
              </button>
              <button
                type="button"
                className="btn-mobile-admin"
                onClick={() => {
                  handleMouseClick();
                  openAuthModal("admin");
                }}
              >
                <i className="fa-solid fa-shield-halved"></i> Admin Portal
              </button>
            </div>
          )}
        </div>

        <ul className="flex-categories-mobile">
          <li>
            <Link to="/" onClick={handleMouseClick}>Home</Link>
          </li>
          <li>
            <Link to="/products" onClick={handleMouseClick}>Shop</Link>
          </li>
          <li>
            <Link to="/products?style=casual" onClick={handleMouseClick}>Collections</Link>
          </li>
          <li>
            <Link to="/products?new=true" onClick={handleMouseClick}>New Arrivals</Link>
          </li>
          <li>
            <Link to="/products?style=casual" onClick={handleMouseClick}>Best Sellers</Link>
          </li>
          <li>
            <a href="#brand-story" onClick={handleMouseClick}>About Our Story</a>
          </li>
          <li className="mobile-nav-divider"></li>
          <li>
            <button
              type="button"
              className="mobile-wishlist-trigger"
              onClick={() => {
                handleMouseClick();
                openWishlist();
              }}
            >
              <span><i className="fa-regular fa-heart"></i> Saved Items</span>
              {wishlistCount > 0 && <span className="mobile-badge-count">{wishlistCount}</span>}
            </button>
          </li>
          <li>
            <Link to="/cart" onClick={handleMouseClick} className="mobile-cart-link">
              <span><i className="fa-solid fa-bag-shopping"></i> Shopping Bag</span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <a
                href="http://localhost:5174/admin"
                target="_blank"
                rel="noreferrer"
                onClick={handleMouseClick}
                style={{ color: "var(--accent-terracotta, #b65c45)", fontWeight: "600" }}
              >
                <i className="fa-solid fa-shield-halved"></i> Admin Portal ↗ (Port 5174)
              </a>
            </li>
          )}
          {user && (
            <li>
              <button
                type="button"
                className="mobile-logout-link"
                onClick={() => {
                  logout();
                  handleMouseClick();
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default HamburgerMobile;
