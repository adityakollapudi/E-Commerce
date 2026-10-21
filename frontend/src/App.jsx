import { useState, useEffect } from "react";
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
import UnderConstruction from "./components/Misc/UnderConstruction";
import AuthModal from "./components/Auth/AuthModal";
import LoginPage from "./components/Auth/LoginPage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AddProduct from "./components/Admin/AddProduct";

function App() {
  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("cart")) ?? []
  );

  const [toast, setToast] = useState({ visible: false, message: "", title: "" });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const showNotification = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast({ visible: false, title: "", message: "" });
    }, 3500);
  };

  const addToCart = (item, quantity, size) => {
    const itemIdWithSize = `${item.id}-${size}`;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.idWithSize === itemIdWithSize
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity || 1;
      setCart(updatedCart);
    } else {
      const newItem = { ...item, quantity, size, idWithSize: itemIdWithSize };
      setCart([...cart, newItem]);
    }

    showNotification(
      "Added to Cart!",
      `${quantity || 1}x ${item.title} (Size: ${(size || "M").toUpperCase()})`
    );
  };

  const decreaseQuantity = (item) => {
    const itemIdWithSize = `${item.id}-${item.size}`;
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.idWithSize === itemIdWithSize
    );
    if (existingItemIndex !== -1 && cart[existingItemIndex].quantity > 1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity -= 1;
      setCart(updatedCart);
    }
  };

  const increaseQuantity = (item) => {
    const itemIdWithSize = `${item.id}-${item.size}`;
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.idWithSize === itemIdWithSize
    );
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    }
  };

  const removeFromCart = (itemIdWithSize) => {
    setCart(cart.filter((item) => item.idWithSize !== itemIdWithSize));
  };

  const clearCart = () => {
    setCart([]);
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={
          <Root
            cart={cart}
            removeFromCart={removeFromCart}
            toast={toast}
            setToast={setToast}
          />
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />}>
          <Route path=":category" element={<Products />}></Route>
        </Route>
        <Route
          path="/products/:category/:id"
          element={<Product addToCart={addToCart} />}
        ></Route>
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/underconstruction" element={<UnderConstruction />} />
        <Route path="*" element={<PageNotFound />}></Route>
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

function Root({ cart, removeFromCart, toast, setToast }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header cart={cart} removeFromCart={removeFromCart} />}
      <ScrollRestoration />
      <Outlet />
      {!isAdminRoute && <Footer />}

      {/* Global Auth Modal accessible from any page */}
      <AuthModal />

      {/* Floating Add to Cart Toast */}
      {toast.visible && (
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

export default App;
