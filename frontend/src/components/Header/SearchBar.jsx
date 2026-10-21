import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { searchProducts } from "../../data/products";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const results = searchProducts(searchTerm).slice(0, 5);
      setSuggestions(results);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="search-bar-wrapper" ref={containerRef}>
      <form onSubmit={handleSubmit} role="search" className="search-bg flex-form">
        <button type="submit" className="btn-search" aria-label="Search">
          <img src="/search-btn.png" className="btn-img" alt="search" />
        </button>
        <input
          type="text"
          name="search-product"
          aria-label="Search Products"
          className="input-search"
          placeholder="Search for clothes, styles, brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="search-suggestions-dropdown">
          <p className="search-suggestions-header">Products ({suggestions.length})</p>
          <ul className="search-suggestions-list">
            {suggestions.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/products/${encodeURIComponent(item.category || "casual")}/${item.id}`}
                  onClick={() => {
                    setShowDropdown(false);
                    setSearchTerm("");
                  }}
                  className="search-suggestion-item"
                >
                  <img
                    src={item.image || (item.images && item.images[0])}
                    alt={item.title}
                    className="suggestion-thumb"
                  />
                  <div className="suggestion-info">
                    <p className="suggestion-title">{item.title}</p>
                    <p className="suggestion-price">₹{Number(item.price).toFixed(2)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="search-view-all-btn"
            onClick={handleSubmit}
          >
            View all results for "{searchTerm}" →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
