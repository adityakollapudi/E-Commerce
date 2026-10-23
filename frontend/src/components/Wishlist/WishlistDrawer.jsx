import { useWishlist } from "../../context/WishlistContext";
import { Link } from "react-router-dom";

const WishlistDrawer = () => {
  const {
    wishlist,
    isWishlistOpen,
    closeWishlist,
    removeFromWishlist,
    moveToCart,
  } = useWishlist();

  if (!isWishlistOpen) return null;

  return (
    <div className="wishlist-overlay" onClick={closeWishlist}>
      <aside
        className="wishlist-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Wishlist Drawer"
      >
        <div className="wishlist-header">
          <div>
            <h2 className="wishlist-title">Saved Items</h2>
            <p className="wishlist-subtitle">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          <button
            onClick={closeWishlist}
            className="wishlist-close-btn"
            aria-label="Close wishlist"
          >
            ✕
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <i className="fa-regular fa-heart"></i>
            </div>
            <h3 className="wishlist-empty-title">Your wishlist is empty</h3>
            <p className="wishlist-empty-text">
              Save pieces you love while exploring our collections and return to them anytime.
            </p>
            <Link
              to="/products"
              onClick={closeWishlist}
              className="btn-luxury btn-primary wishlist-explore-btn"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-items-list">
              {wishlist.map((item) => {
                const numPrice = Number(item.price) || 0;
                return (
                  <div key={item.id} className="wishlist-item-card">
                    <Link
                      to={`/products/${encodeURIComponent(item.category || "casual")}/${item.id}`}
                      onClick={closeWishlist}
                      className="wishlist-item-img-link"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="wishlist-item-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/introImageCompressed.jfif";
                        }}
                      />
                    </Link>
                    <div className="wishlist-item-details">
                      <Link
                        to={`/products/${encodeURIComponent(item.category || "casual")}/${item.id}`}
                        onClick={closeWishlist}
                        className="wishlist-item-name"
                      >
                        {item.title}
                      </Link>
                      <p className="wishlist-item-price">₹{numPrice.toFixed(2)}</p>
                      <div className="wishlist-item-actions">
                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          className="btn-luxury btn-primary wishlist-move-btn"
                        >
                          <i className="fa-solid fa-bag-shopping"></i> Move to Bag
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className="wishlist-remove-btn"
                          title="Remove from wishlist"
                          aria-label={`Remove ${item.title}`}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="wishlist-footer">
              <Link
                to="/cart"
                onClick={closeWishlist}
                className="btn-luxury btn-outline wishlist-view-cart-btn"
              >
                View Shopping Bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default WishlistDrawer;
