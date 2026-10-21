import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HamburgerMobile = ({ mobileMenuShow, handleMouseClick }) => {
  const { user, isAdmin, openAuthModal, logout } = useAuth();

  return (
    <>
      <div
        onTouchStart={handleMouseClick}
        onClick={handleMouseClick}
        className={`outside-hamburger-click-close ${mobileMenuShow ? "opened" : ""}`}
      ></div>

      <nav className={`mobile-hamburger-container ${mobileMenuShow ? "opened" : ""}`}>
        <button onClick={handleMouseClick} aria-label="close" type="button" className="btn-modal-close">
          <i className="fa-solid fa-xmark fa-2xl"></i>
        </button>

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

        <ul className="flex-categories-mobile text--xl">
          <li>
            <Link to="/products" onClick={handleMouseClick}>Shop Catalog</Link>
          </li>
          <li>
            <Link to="/products?new=true" onClick={handleMouseClick}>New Arrivals</Link>
          </li>
          <li>
            <Link to="/products?style=casual" onClick={handleMouseClick}>Best Sellers</Link>
          </li>
          <li>
            <Link to="/cart" onClick={handleMouseClick}>My Cart</Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin" onClick={handleMouseClick} style={{ color: "#d97706", fontWeight: "bold" }}>
                <i className="fa-solid fa-gauge-high"></i> Admin Dashboard
              </Link>
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
