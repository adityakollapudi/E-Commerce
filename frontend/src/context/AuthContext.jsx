import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY_USER = "shop_auth_user";
const STORAGE_KEY_TOKEN = "shop_auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("user"); // 'user' | 'admin' | 'register'
  const [loading, setLoading] = useState(false);

  // Synchronize state with localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [user, token]);

  // Session verification on app initialization:
  // Validates the stored token against GET /api/auth/me to ensure:
  // 1. Expired/invalid tokens are automatically cleared from localStorage.
  // 2. Client-side user profile and roles match authoritative server data.
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!savedToken) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.user) {
            // Overwrite with authoritative server data
            setUser(data.user);
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token is expired, invalid, or revoked
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
          }
        }
      } catch (err) {
        // Network offline: preserve existing state without elevating permissions
        console.warn("Could not verify session with server (offline mode)");
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthModal = (tab = "user") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Login handler
  const login = async (email, password, roleHint = null) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, roleHint }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to log in.");
      }

      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register handler (strictly registers as standard customer)
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to register account.");
      }

      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // One-click demo login (dev mode)
  const quickLogin = async (role = "user") => {
    if (role === "admin") {
      try {
        return await login("admin@giftingwellness.com", "admin123", "admin");
      } catch {
        return await login("admin@shop.co", "admin123", "admin");
      }
    } else {
      try {
        return await login("user@giftingwellness.com", "user123", "user");
      } catch {
        return await login("user@shop.co", "user123", "user");
      }
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const value = {
    user,
    token,
    isAdmin: user?.role === "admin",
    isLoggedIn: !!user,
    loading,
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    quickLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
