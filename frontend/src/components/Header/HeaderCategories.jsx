import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";

const HeaderCategories = ({ dropdownShow, handleMouseIn, handleMouseOut }) => {
  return (
    <nav className="header-nav">
      <ul className="flex-header flex-categories">
        <li
          className={`dropdown-enter ${dropdownShow ? "active" : ""}`}
          onMouseEnter={handleMouseIn}
          onMouseOut={handleMouseOut}
        >
          <Dropdown dropdownShow={dropdownShow} />
          <Link to="/products">
            Shop <i className="fa-solid fa-chevron-down" style={{ fontSize: "11px", marginLeft: "4px" }}></i>
          </Link>
        </li>
        <li>
          <Link to="/products?style=casual">On Sale</Link>
        </li>
        <li>
          <Link to="/products?new=true">New Arrivals</Link>
        </li>
        <li>
          <Link to="/products">Brands</Link>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderCategories;
