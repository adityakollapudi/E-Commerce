import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";

const HeaderCategories = ({ dropdownShow, handleMouseIn, handleMouseOut }) => {
  return (
    <nav className="header-nav" aria-label="Main Navigation">
      <ul className="flex-header flex-categories">
        <li>
          <Link to="/" className="nav-link-item">
            Home
          </Link>
        </li>
        <li>
          <Link to="/products" className="nav-link-item">
            Shop
          </Link>
        </li>
        <li
          className={`dropdown-enter ${dropdownShow ? "active" : ""}`}
          onMouseEnter={handleMouseIn}
          onMouseLeave={handleMouseOut}
        >
          <Dropdown dropdownShow={dropdownShow} />
          <Link to="/products" className="nav-link-item">
            Collections <i className="fa-solid fa-chevron-down nav-chevron-icon"></i>
          </Link>
        </li>
        <li>
          <Link to="/products?new=true" className="nav-link-item">
            New Arrivals
          </Link>
        </li>
        <li>
          <Link to="/products?style=casual" className="nav-link-item">
            Best Sellers
          </Link>
        </li>
        <li>
          <a href="#brand-story" className="nav-link-item">
            About
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderCategories;
