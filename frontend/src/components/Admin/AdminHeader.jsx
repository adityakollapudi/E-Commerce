import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="admin-nav-bar">
      <div className="container admin-nav-content">
        <div className="admin-nav-left">
          <Link to="/" className="admin-logo-link" title="Return to Customer Storefront">
            <img src="/SHOP.CO.png" alt="SHOP.CO" className="admin-brand-img" />
          </Link>
          <div className="admin-portal-pill">
            <i className="fa-solid fa-shield-halved"></i> Admin Control Panel
          </div>
        </div>

        <nav className="admin-nav-links">
          <Link
            to="/admin"
            className={`admin-nav-link ${location.pathname === "/admin" ? "active" : ""}`}
          >
            <i className="fa-solid fa-table-list"></i> Catalog & Inventory
          </Link>
          <Link
            to="/admin/add-product"
            className={`admin-nav-link ${location.pathname === "/admin/add-product" ? "active" : ""}`}
          >
            <i className="fa-solid fa-plus-circle"></i> Add New Product
          </Link>
          <Link to="/products" className="admin-nav-link storefront-link" target="_blank">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> Live Storefront
          </Link>
        </nav>

        <div className="admin-nav-right">
          <div className="admin-user-pill">
            <span className="admin-avatar">
              <i className="fa-solid fa-user-shield"></i>
            </span>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || "Admin"}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-admin-logout"
            onClick={logout}
            title="Sign out of Admin session"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
