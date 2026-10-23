import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("atelier_cart") || localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load cart from storage", e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState({ visible: false, title: "", message: "" });

  // Sync to both localStorage keys for full compatibility
  useEffect(() => {
    try {
      const serialized = JSON.stringify(cart);
      localStorage.setItem("atelier_cart", serialized);
      localStorage.setItem("cart", serialized);
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [cart]);

  const showNotification = (title, message) => {
    setCartToast({ visible: true, title, message });
    setTimeout(() => {
      setCartToast({ visible: false, title: "", message: "" });
    }, 3500);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  /**
   * Add an item to the shopping bag
   * @param {Object} item - Product details
   * @param {number} quantity - Quantity to add (default: 1)
   * @param {string} size - Size string or "Standard"
   * @param {Object} options - Additional variant options (e.g., color, openDrawer)
   */
  const addToCart = (item, quantity = 1, size = "Standard", options = {}) => {
    if (!item || !item.id) return;

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const resolvedSize = (size && typeof size === "string" && size.trim()) ? size.trim() : "Standard";
    const selectedColor = options.color || item.selectedColor || "";
    
    // Unique cart line identifier
    const idWithSize = `${item.id}-${resolvedSize}${selectedColor ? `-${selectedColor}` : ""}`;

    const primaryImage =
      item.image ||
      item.img ||
      (Array.isArray(item.images) && item.images[0]) ||
      "/introImageCompressed.jfif";

    const numPrice = Number(item.price) || 0;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.idWithSize === idWithSize);

      if (existingIndex !== -1) {
        const nextCart = [...prevCart];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + qty,
          price: numPrice, // keep price synchronized
        };
        return nextCart;
      } else {
        const newItem = {
          id: item.id,
          title: item.title,
          price: numPrice,
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          category: item.category || "general",
          image: primaryImage,
          size: resolvedSize,
          selectedColor: selectedColor || null,
          idWithSize,
          quantity: qty,
          moq: item.moq || 1,
        };
        return [...prevCart, newItem];
      }
    });

    const displaySize = resolvedSize && resolvedSize !== "Standard" ? ` (Size: ${resolvedSize.toUpperCase()})` : "";
    showNotification("Added to Shopping Bag!", `${qty}x ${item.title}${displaySize}`);

    // Auto-open drawer if requested (default: true for instant feedback)
    if (options.openDrawer !== false) {
      setIsCartOpen(true);
    }
  };

  const decreaseQuantity = (itemOrId) => {
    const idKey = typeof itemOrId === "string" ? itemOrId : itemOrId?.idWithSize;
    if (!idKey) return;

    setCart((prevCart) => {
      const index = prevCart.findIndex((ci) => ci.idWithSize === idKey);
      if (index === -1) return prevCart;

      if (prevCart[index].quantity > 1) {
        const nextCart = [...prevCart];
        nextCart[index] = { ...nextCart[index], quantity: nextCart[index].quantity - 1 };
        return nextCart;
      } else {
        // If decreasing from 1, remove item
        return prevCart.filter((ci) => ci.idWithSize !== idKey);
      }
    });
  };

  const increaseQuantity = (itemOrId) => {
    const idKey = typeof itemOrId === "string" ? itemOrId : itemOrId?.idWithSize;
    if (!idKey) return;

    setCart((prevCart) => {
      const index = prevCart.findIndex((ci) => ci.idWithSize === idKey);
      if (index === -1) return prevCart;

      const nextCart = [...prevCart];
      nextCart[index] = { ...nextCart[index], quantity: nextCart[index].quantity + 1 };
      return nextCart;
    });
  };

  const removeFromCart = (idWithSize) => {
    if (!idWithSize) return;
    setCart((prevCart) => prevCart.filter((item) => item.idWithSize !== idWithSize));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQuantity,
        increaseQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        cartToast,
        setCartToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: [],
      addToCart: () => {},
      decreaseQuantity: () => {},
      increaseQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      totalItems: 0,
      subtotal: 0,
      isCartOpen: false,
      openCart: () => {},
      closeCart: () => {},
      toggleCart: () => {},
      cartToast: { visible: false, title: "", message: "" },
      setCartToast: () => {},
    };
  }
  return context;
};

export default CartContext;
