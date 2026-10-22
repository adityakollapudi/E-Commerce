import { useState, useRef, useEffect } from "react";
import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HeaderProfileBtn = ({ cart, handleMouseClick }) => {
  const { user, isAdmin, logout, openAuthModal, quickLogin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const calculateItemsNumber = () => {
    return cart.reduce((acc, item) => (acc += item.quantity), 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="profile-btn-flex">
      <button
        className="btn-profile btn-search btn-search-mobile"
        onClick={handleMouseClick}
        aria-label="Search items"
      >
        <img src="/search-btn-black.png" className="btn-img" alt="search" />
      </button>

      <SearchBar />

      {/* Cart Icon */}
      <Link
        to="/cart"
        className="btn-profile btn-search card-item-count-container"
        aria-label="View Cart"
      >
        <img src="/cart.png" alt="cart" />
        {cart.length > 0 && (
          <span className="cart-item-count text--xxs">
            {calculateItemsNumber()}
          </span>
        )}
      </Link>

      {/* Prominent Customer Login Button when not logged in */}
      {!user && (
        <button
          type="button"
          className="btn-header-customer-login"
          onClick={() => openAuthModal("user")}
          title="Sign in as customer"
        >
          <i className="fa-regular fa-user"></i>
          <span className="customer-login-label">Customer Login</span>
        </button>
      )}

      {/* Profile / Account Area Dropdown */}
      <div className="profile-menu-container" ref={menuRef}>
        <button
          className={`btn-profile header-avatar-btn ${
            user ? "logged-in" : ""
          } ${isAdmin ? "is-admin" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={user ? `Account menu for ${user.name}` : "Account options"}
        >
          {user ? (
            <span className="user-initials-badge">
              {isAdmin ? (
                <i className="fa-solid fa-user-shield"></i>
              ) : (
                getInitials(user.name)
              )}
            </span>
          ) : (
            <span className="header-anon-icon" title="More login options">
              <img src="/profile.png" alt="profile menu" />
            </span>
          )}

          {user && (
            <span className="header-user-firstname">
              {isAdmin ? "Admin" : user.name.split(" ")[0]}
              <i className="fa-solid fa-chevron-down header-chevron-icon"></i>
            </span>
          )}

          {isAdmin && <span className="admin-status-dot" title="Admin Active"></span>}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="header-account-dropdown" role="menu">
            {user ? (
              // LOGGED IN VIEW
              <div className="dropdown-logged-in">
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-circle">
                    {isAdmin ? (
                      <i className="fa-solid fa-shield-halved"></i>
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="dropdown-user-details">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                    <span
                      className={`dropdown-role-pill ${
                        isAdmin ? "role-admin" : "role-customer"
                      }`}
                    >
                      {isAdmin ? "⭐ Store Administrator" : "Customer Account"}
                    </span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                {isAdmin && (
                  <div className="dropdown-admin-actions">
                    <a
                      href="http://localhost:5174/admin"
                      className="dropdown-menu-item highlight-admin"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      title="Open dedicated Admin Management Portal on Port 5174"
                    >
                      <i className="fa-solid fa-shield-halved"></i>
                      <span>Admin Portal ↗ (Port 5174)</span>
                    </a>
                    <a
                      href="http://localhost:5174/admin/add-product"
                      className="dropdown-menu-item highlight-action"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      title="Add product via Admin Portal on Port 5174"
                    >
                      <i className="fa-solid fa-circle-plus"></i>
                      <span>+ Add Product (Port 5174)</span>
                    </a>
                  </div>
                )}

                <div className="dropdown-common-actions">
                  <Link
                    to="/products"
                    className="dropdown-menu-item"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    <i className="fa-solid fa-bag-shopping"></i>
                    <span>Browse Catalog</span>
                  </Link>

                  <Link
                    to="/cart"
                    className="dropdown-menu-item"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    <i className="fa-solid fa-cart-shopping"></i>
                    <span>My Cart ({calculateItemsNumber()})</span>
                  </Link>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-menu-item btn-dropdown-logout"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              // NOT LOGGED IN VIEW
              <div className="dropdown-anonymous">
                <div className="dropdown-anon-header">
                  <h4>Account Access</h4>
                  <p>Choose your login option below:</p>
                </div>

                <div className="dropdown-anon-buttons">
                  <button
                    type="button"
                    className="btn-dropdown-primary"
                    onClick={() => {
                      openAuthModal("user");
                      setMenuOpen(false);
                    }}
                  >
                    <i className="fa-regular fa-user"></i> Customer Sign In
                  </button>

                  <button
                    type="button"
                    className="btn-dropdown-admin"
                    onClick={() => {
                      openAuthModal("admin");
                      setMenuOpen(false);
                    }}
                  >
                    <i className="fa-solid fa-shield-halved"></i> Store Admin Portal
                  </button>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-quick-test">
                  <span className="quick-test-label">⚡ 1-Click Demo Login:</span>
                  <div className="quick-test-row">
                    <button
                      type="button"
                      className="btn-quick-pill pill-user"
                      onClick={() => {
                        quickLogin("user");
                        setMenuOpen(false);
                      }}
                      title="user@shop.co"
                    >
                      👤 Customer Demo
                    </button>
                    <button
                      type="button"
                      className="btn-quick-pill"
                      onClick={() => {
                        quickLogin("admin");
                        setMenuOpen(false);
                      }}
                      title="admin@shop.co"
                    >
                      🛡️ Admin Demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderProfileBtn;