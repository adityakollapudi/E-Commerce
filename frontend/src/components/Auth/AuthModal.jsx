import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    quickLogin,
    loading,
  } = useAuth();

  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleTabChange = (tab) => {
    setAuthModalTab(tab);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (authModalTab === "register") {
      if (!name.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!email.trim()) {
        setErrorMsg("Please enter your email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      const res = await register(name, email, password);
      if (!res.success) {
        setErrorMsg(res.message || "Registration failed.");
      } else {
        setSuccessMsg("Welcome! Your account has been created.");
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      }
    } else {
      // User or Admin Login
      if (!email.trim() || !password) {
        setErrorMsg("Please enter both email and password.");
        return;
      }

      const roleHint = authModalTab === "admin" ? "admin" : null;
      const res = await login(email, password, roleHint);

      if (!res.success) {
        setErrorMsg(res.message || "Authentication failed.");
      } else {
        setSuccessMsg(
          authModalTab === "admin"
            ? "Admin authenticated! Redirecting to dashboard..."
            : "Signed in successfully!"
        );
        setTimeout(() => {
          closeAuthModal();
          if (authModalTab === "admin") {
            navigate("/admin");
          }
        }, 1000);
      }
    }
  };

  const handleQuickDemo = async (role) => {
    setErrorMsg("");
    setSuccessMsg("");
    const res = await quickLogin(role);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(
        role === "admin"
          ? "Admin access granted! Entering dashboard..."
          : "Signed in as demo customer!"
      );
      setTimeout(() => {
        closeAuthModal();
        if (role === "admin") {
          navigate("/admin");
        }
      }, 900);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div
        className={`auth-modal-card ${authModalTab === "admin" ? "admin-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Close authentication window"
        >
          ✕
        </button>

        {/* Modal Header Tabs */}
        <div className="auth-tabs-nav">
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === "user" ? "active" : ""}`}
            onClick={() => handleTabChange("user")}
          >
            <i className="fa-regular fa-user"></i> Customer Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn admin-tab ${authModalTab === "admin" ? "active" : ""}`}
            onClick={() => handleTabChange("admin")}
          >
            <i className="fa-solid fa-shield-halved"></i> Admin Portal
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
          >
            <i className="fa-solid fa-user-plus"></i> Create Account
          </button>
        </div>

        {/* Quick Demo Login Callout */}
        {authModalTab === "user" && (
          <div className="demo-callout customer-demo">
            <div className="demo-callout-info">
              <span className="demo-pill">Quick Demo</span>
              <p>Instant access with sample customer account</p>
            </div>
            <button
              type="button"
              className="btn-quick-demo"
              onClick={() => handleQuickDemo("user")}
              disabled={loading}
            >
              1-Click Customer Login →
            </button>
          </div>
        )}

        {authModalTab === "admin" && (
          <div className="demo-callout admin-demo">
            <div className="demo-callout-info">
              <span className="demo-pill admin-pill">Admin Access</span>
              <p>Sign in as store manager to add & edit products</p>
            </div>
            <button
              type="button"
              className="btn-quick-demo btn-admin-demo"
              onClick={() => handleQuickDemo("admin")}
              disabled={loading}
            >
              ⚡ 1-Click Admin Login →
            </button>
          </div>
        )}

        {/* Title & Description */}
        <div className="auth-header-copy">
          <h2 id="auth-modal-title" className="auth-title">
            {authModalTab === "admin"
              ? "Store Administrator Portal"
              : authModalTab === "register"
              ? "Create Customer Account"
              : "Welcome Back to SHOP.CO"}
          </h2>
          <p className="auth-subtitle">
            {authModalTab === "admin"
              ? "Authorized store management area. Manage inventory and add new products."
              : authModalTab === "register"
              ? "Join to track your orders, save favorites, and receive VIP offers."
              : "Sign in to access your cart, order history, and exclusive discounts."}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="auth-alert error-alert" role="alert">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success-alert" role="status">
            <i className="fa-solid fa-circle-check"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authModalTab === "register" && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <div className="input-with-icon">
                <i className="fa-regular fa-id-badge input-icon"></i>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">
              {authModalTab === "admin" ? "Admin Email Address" : "Email Address"}
            </label>
            <div className="input-with-icon">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                id="auth-email"
                type="email"
                placeholder={
                  authModalTab === "admin" ? "admin@shop.co" : "your.email@example.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="auth-password">Password</label>
              {authModalTab !== "register" && (
                <button
                  type="button"
                  className="btn-forgot-password"
                  onClick={() =>
                    setErrorMsg("Please use the demo account button above for instant testing.")
                  }
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="input-with-icon">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder={authModalTab === "admin" ? "admin123" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={authModalTab === "register" ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          {authModalTab === "register" && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {authModalTab === "admin" && (
            <div className="admin-hint-box">
              <i className="fa-solid fa-key"></i>
              <span>Default Credentials: <strong>admin@shop.co</strong> / <strong>admin123</strong></span>
            </div>
          )}

          {authModalTab === "user" && (
            <div className="customer-hint-box">
              <i className="fa-solid fa-user-tag"></i>
              <span>Default Credentials: <strong>user@shop.co</strong> / <strong>user123</strong></span>
            </div>
          )}

          <button
            type="submit"
            className={`btn-auth-submit ${authModalTab === "admin" ? "btn-admin-submit" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-inline">
                <i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating...
              </span>
            ) : authModalTab === "admin" ? (
              "Sign In to Admin Dashboard →"
            ) : authModalTab === "register" ? (
              "Complete Registration"
            ) : (
              "Sign In to Account"
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="auth-modal-footer">
          {authModalTab === "register" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="link-switch-auth"
                onClick={() => handleTabChange("user")}
              >
                Sign In here
              </button>
            </p>
          ) : authModalTab === "admin" ? (
            <p>
              Looking for consumer shopping?{" "}
              <button
                type="button"
                className="link-switch-auth"
                onClick={() => handleTabChange("user")}
              >
                Switch to Customer Login
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                className="link-switch-auth"
                onClick={() => handleTabChange("register")}
              >
                Sign up for free
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
