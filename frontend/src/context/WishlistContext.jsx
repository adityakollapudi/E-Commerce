import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children, onAddToCart }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem("atelier_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("atelier_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  const toggleWishlist = (product) => {
    if (!product || !product.id) return;
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === String(product.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(product.id));
      } else {
        const itemToSave = {
          id: product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          discountPercent: product.discountPercent,
          category: product.category,
          image:
            product.image ||
            product.img ||
            (Array.isArray(product.images) && product.images[0]) ||
            "/introImageCompressed.jfif",
          rating: product.rating,
        };
        return [...prev, itemToSave];
      }
    });
  };

  const isInWishlist = (id) => {
    if (!id) return false;
    return wishlist.some((item) => String(item.id) === String(id));
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const moveToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product, 1, "M");
    }
    removeFromWishlist(product.id);
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveToCart,
        addToCart: onAddToCart,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlist: [],
      toggleWishlist: () => {},
      isInWishlist: () => false,
      removeFromWishlist: () => {},
      moveToCart: () => {},
      addToCart: () => {},
      isWishlistOpen: false,
      openWishlist: () => {},
      closeWishlist: () => {},
      wishlistCount: 0,
    };
  }
  return context;
};
