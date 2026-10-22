import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="admin-nav-bar">
      <div className="container admin-nav-content">
        <div className="admin-nav-left">
          <Link to="/admin" className="admin-logo-link" title="SHOP.CO Admin Portal">
            <img src="/SHOP.CO.png" alt="SHOP.CO" className="admin-brand-img" />
          </Link>
          <div className="admin-portal-pill">
            <i className="fa-solid fa-shield-halved"></i> Admin Portal
            <span className="admin-port-chip">
              Port 5174 → API 5001
            </span>
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
          <Link
            to="/admin/import"
            className={`admin-nav-link ${location.pathname === "/admin/import" ? "active" : ""}`}
          >
            <i className="fa-solid fa-file-import"></i> Bulk Import
          </Link>
          <a
            href="http://localhost:5173"
            className="admin-nav-link storefront-link"
            target="_blank"
            rel="noreferrer"
            title="Open Customer Storefront on Port 5173"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i> View Storefront (Port 5173)
          </a>
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
