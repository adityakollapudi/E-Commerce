import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ServicesDropdown from "./ServicesDropdown";
import GiftingCategoriesMegaMenu from "./GiftingCategoriesMegaMenu";
import BrandedGiftingDropdown from "./BrandedGiftingDropdown";
import FestiveGiftsDropdown from "./FestiveGiftsDropdown";
import ContactUsDropdown from "./ContactUsDropdown";

const HeaderCategories = ({ onOpenBulkModal, onOpenCatalogueModal }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (menuName) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const closeMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(null);
  };

  return (
    <nav className="header-nav luxury-gifting-nav" aria-label="Main Navigation">
      <ul className="flex-header flex-categories gifting-nav-list">
        {/* 1. Home */}
        <li className="nav-item">
          <Link to="/" className="nav-link-item" onClick={closeMenu}>
            Home
          </Link>
        </li>

        {/* 2. About Us */}
        <li className="nav-item">
          <a href="#brand-story" className="nav-link-item" onClick={closeMenu}>
            About Us
          </a>
        </li>

        {/* 3. Services (Dropdown on hover) */}
        <li
          className={`nav-item dropdown-parent ${activeMenu === "services" ? "is-active" : ""}`}
          onMouseEnter={() => handleMouseEnter("services")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="nav-link-item nav-dropdown-btn"
            aria-expanded={activeMenu === "services"}
            aria-haspopup="true"
          >
            <span>Services</span>
            <i className="fa-solid fa-chevron-down nav-chevron-icon"></i>
          </button>
          <ServicesDropdown
            isOpen={activeMenu === "services"}
            onClose={closeMenu}
            onOpenBulkModal={onOpenBulkModal}
          />
        </li>

        {/* 4. Gifting Categories (2-level cascading mega menu on hover!) */}
        <li
          className={`nav-item dropdown-parent mega-parent ${activeMenu === "categories" ? "is-active" : ""}`}
          onMouseEnter={() => handleMouseEnter("categories")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="nav-link-item nav-dropdown-btn highlight-mega-trigger"
            aria-expanded={activeMenu === "categories"}
            aria-haspopup="true"
          >
            <span className="category-gift-icon">
              <i className="fa-solid fa-gift"></i>
            </span>
            <span>Gifting Categories</span>
            <i className="fa-solid fa-chevron-down nav-chevron-icon"></i>
          </button>
          <GiftingCategoriesMegaMenu
            isOpen={activeMenu === "categories"}
            onClose={closeMenu}
            onOpenBulkModal={onOpenBulkModal}
          />
        </li>

        {/* 5. Branded Gifting (Dropdown on hover) */}
        <li
          className={`nav-item dropdown-parent ${activeMenu === "branded" ? "is-active" : ""}`}
          onMouseEnter={() => handleMouseEnter("branded")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="nav-link-item nav-dropdown-btn"
            aria-expanded={activeMenu === "branded"}
            aria-haspopup="true"
          >
            <span>Branded Gifting</span>
            <i className="fa-solid fa-chevron-down nav-chevron-icon"></i>
          </button>
          <BrandedGiftingDropdown
            isOpen={activeMenu === "branded"}
            onClose={closeMenu}
          />
        </li>

        {/* 6. Festive Gifts (Dropdown on hover) */}
        <li
          className={`nav-item dropdown-parent ${activeMenu === "festive" ? "is-active" : ""}`}
          onMouseEnter={() => handleMouseEnter("festive")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="nav-link-item nav-dropdown-btn festive-nav-trigger"
            aria-expanded={activeMenu === "festive"}
            aria-haspopup="true"
          >
            <span className="festive-sparkle-dot">✨</span>
            <span>Festive Gifts</span>
            <i className="fa-solid fa-chevron-down nav-chevron-icon"></i>
          </button>
          <FestiveGiftsDropdown
            isOpen={activeMenu === "festive"}
            onClose={closeMenu}
            onOpenBulkModal={onOpenBulkModal}
          />
        </li>

        {/* 7. Contact Us (Dropdown on hover) */}
        <li
          className={`nav-item dropdown-parent ${activeMenu === "contact" ? "is-active" : ""}`}
          onMouseEnter={() => handleMouseEnter("contact")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className="nav-link-item nav-dropdown-btn"
            aria-expanded={activeMenu === "contact"}
            aria-haspopup="true"
          >
            <span>Contact Us</span>
            <i className="fa-solid fa-chevron-down nav-chevron-icon"></i>
          </button>
          <ContactUsDropdown
            isOpen={activeMenu === "contact"}
            onClose={closeMenu}
            onOpenBulkModal={onOpenBulkModal}
          />
        </li>

        {/* 8. Download Catalogues Button */}
        <li className="nav-item nav-item-action">
          <button
            type="button"
            onClick={() => {
              closeMenu();
              if (onOpenCatalogueModal) onOpenCatalogueModal();
            }}
            className="nav-action-btn btn-catalogues"
            title="Download PDF Catalogues"
          >
            <i className="fa-solid fa-file-arrow-down"></i>
            <span>Catalogues</span>
          </button>
        </li>

        {/* 9. Enquiry for Bulk Orders (Login/Signup) CTA */}
        <li className="nav-item nav-item-action">
          <button
            type="button"
            onClick={() => {
              closeMenu();
              if (onOpenBulkModal) onOpenBulkModal();
            }}
            className="nav-action-btn btn-bulk-nav-cta"
            title="Request Bulk Quotation"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Bulk Enquiry</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderCategories;
