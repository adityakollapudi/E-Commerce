import { useState } from "react";
import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Outlet,
  ScrollRestoration,
  Link,
  useLocation,
} from "react-router-dom";
import "./index.css";
import Home from "./components/Home/Home";
import Products from "./components/Products/Products";
import Product from "./components/Products/Product/Product";
import PageNotFound from "./components/Misc/PageNotFound";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Cart from "./components/Cart/Cart";
import CartDrawer from "./components/Cart/CartDrawer";
import UnderConstruction from "./components/Misc/UnderConstruction";
import AuthModal from "./components/Auth/AuthModal";
import LoginPage from "./components/Auth/LoginPage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AddProduct from "./components/Admin/AddProduct";
import AdminImport from "./components/Admin/AdminImport";
import AdminPortNotice from "./components/Admin/AdminPortNotice";
import ManageSiteContent from "./components/Admin/ManageSiteContent";
import { WishlistProvider } from "./context/WishlistContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { CartProvider, useCart } from "./context/CartContext";
import WishlistDrawer from "./components/Wishlist/WishlistDrawer";

function AppContent() {
  const {
    cart,
    addToCart,
    decreaseQuantity,
    increaseQuantity,
    removeFromCart,
    clearCart,
    cartToast,
    setCartToast,
  } = useCart();

  // Detect whether frontend is running on the dedicated Admin Port (5174)
  const isPortalAdmin =
    (typeof window !== "undefined" && window.location.port === "5174") ||
    import.meta.env.VITE_PORTAL_TYPE === "admin";

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={
          <Root
            cart={cart}
            removeFromCart={removeFromCart}
            toast={cartToast}
            setToast={setCartToast}
            isPortalAdmin={isPortalAdmin}
          />
        }
      >
        {isPortalAdmin ? (
          // ==================== PORT 5174: ADMIN MANAGEMENT PORTAL ====================
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route path="/admin/import" element={<AdminImport />} />
            <Route path="/admin/site-content" element={<ManageSiteContent />} />
            <Route path="/products" element={<Products />}>
              <Route path=":category" element={<Products />} />
            </Route>
            <Route path="/products/:category/:id" element={<Product addToCart={addToCart} />} />
            <Route path="*" element={<AdminDashboard />} />
          </>
        ) : (
          // ==================== PORT 5173: CUSTOMER STOREFRONT (VIEW ONLY) ====================
          <>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />}>
              <Route path=":category" element={<Products />} />
            </Route>
            <Route
              path="/products/:category/:id"
              element={<Product addToCart={addToCart} />}
            />
            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  decreaseQuantity={decreaseQuantity}
                  increaseQuantity={increaseQuantity}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            {/* On Port 5173, accessing admin routes shows the Admin Port 5174 notice */}
            <Route path="/admin" element={<AdminPortNotice />} />
            <Route path="/admin/add-product" element={<AdminPortNotice />} />
            <Route path="/admin/import" element={<AdminPortNotice />} />
            <Route path="/admin/site-content" element={<AdminPortNotice />} />
            <Route path="/underconstruction" element={<UnderConstruction />} />
            <Route path="*" element={<PageNotFound />} />
          </>
        )}
      </Route>
    )
  );

  return (
    <WishlistProvider onAddToCart={addToCart}>
      <RouterProvider router={router} />
    </WishlistProvider>
  );
}

function Root({ cart, removeFromCart, toast, setToast, isPortalAdmin }) {
  const location = useLocation();
  const isAdminRoute = isPortalAdmin || location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header cart={cart} removeFromCart={removeFromCart} />}
      <ScrollRestoration />
      <Outlet />
      {!isAdminRoute && <Footer />}

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer />

      {/* Global Auth Modal accessible from any page */}
      <AuthModal />

      {/* Floating Add to Cart Toast */}
      {toast?.visible && (
        <aside aria-label="Notification" className="cart-toast-banner">
          <div className="cart-toast-content">
            <div className="toast-icon">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <div className="toast-text">
              <p className="toast-title">{toast.title}</p>
              <p className="toast-sub">{toast.message}</p>
            </div>
          </div>
          <div className="toast-actions">
            <Link
              to="/cart"
              className="toast-cart-link"
              onClick={() => setToast({ visible: false, title: "", message: "" })}
            >
              View Cart →
            </Link>
            <button
              className="toast-close"
              onClick={() => setToast({ visible: false, title: "", message: "" })}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

function App() {
  return (
    <SiteContentProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </SiteContentProvider>
  );
}

export default App;
