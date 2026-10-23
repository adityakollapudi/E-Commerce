import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchMobile = ({ mobileSearchShow, handleMouseClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleMouseClick();
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`mobile-search-container ${mobileSearchShow ? "opened" : ""}`}
    >
      <div className="mobile-search-close">
        <button onClick={handleMouseClick} aria-label="close" type="button">
          <i className="fa-solid fa-xmark fa-2xl"></i>
        </button>
      </div>
      <div className="mobile-search">
        <label htmlFor="search-product" hidden>
          Search for items
        </label>
        <button type="submit" className="btn-search" aria-label="Search">
          <img src="/search-btn.png" className="btn-img" alt="search" />
        </button>
        <input
          type="text"
          name="search-product"
          id="search-product"
          aria-label="Search Products"
          placeholder="Search gifts, bottles, bags, gadgets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </form>
  );
};

export default SearchMobile;
