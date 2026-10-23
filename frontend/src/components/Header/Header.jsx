import HeaderCategories from "./HeaderCategories";
import SearchMobile from "./SearchMobile";
import HeaderProfileBtn from "./HeaderProfileBtn";
import HamburgerMobile from "./HamburgerMobile";
import BulkEnquiryModal from "./BulkEnquiryModal";
import CatalogueDownloadModal from "./CatalogueDownloadModal";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSiteContent } from "../../context/SiteContentContext";

const Header = ({ cart, removeFromCart }) => {
  const { user, isAdmin, openAuthModal } = useAuth();
  const { announcement, navigation } = useSiteContent();
  const [mobileSearchShow, setMobileSearchShow] = useState(false);
  const [mobileMenuShow, setMobileMenuShow] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Modals for Bulk Enquiry and Catalogue Download
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkInitialCategory, setBulkInitialCategory] = useState("");
  const [catalogueModalOpen, setCatalogueModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseClick = (setStateElementShow) => {
    setStateElementShow((prevState) => !prevState);
    document.body.classList.toggle("body-noscroll");
  };

  const handleOpenBulkModal = (category = "") => {
    setBulkInitialCategory(category || "");
    setBulkModalOpen(true);
  };

  const handleOpenCatalogueModal = () => {
    setCatalogueModalOpen(true);
  };

  return (
    <>
      <a className="sr-only" href="#main-content">
        Skip to main content
      </a>

      {/* Top Announcement & Corporate Quick Strip */}
      {showAnnouncement && (
        <div className="top-announcement-bar gifting-top-bar">
          <div className="container top-announcement-content">
            <div className="announcement-left-wrap">
              <span className="announcement-badge-pill">
                <i className="fa-solid fa-gift"></i> {announcement?.badge?.replace(/^[^\w]+/, "") || "Corporate & Festive Gifting"}
              </span>
              <p className="announcement-text">
                {announcement?.text || "Custom logo branding on 10,000+ items · Free digital sample on bulk orders · Pan-India delivery."}
              </p>
            </div>

            <div className="top-auth-actions gifting-top-actions">
              {/* Download Catalogues Top Link */}
              <button
                type="button"
                onClick={handleOpenCatalogueModal}
                className="top-quick-cta-btn"
                title="Download Corporate & Festive Catalogues"
              >
                <i className="fa-solid fa-file-arrow-down"></i>
                <span>Download Catalogues</span>
              </button>

              <span className="top-auth-pipe">|</span>

              {/* Enquiry for Bulk Orders (Login/Signup) */}
              <button
                type="button"
                onClick={() => handleOpenBulkModal()}
                className="top-quick-cta-btn highlight-bulk-btn"
                title="Enquiry for Bulk Orders (Login/Signup)"
              >
                <i className="fa-solid fa-boxes-packing"></i>
                <span>Enquiry for Bulk Orders</span>
              </button>

              <span className="top-auth-pipe">|</span>

              {!user ? (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal("user")}
                    className="top-auth-btn"
                  >
                    <i className="fa-regular fa-user"></i> Login / Signup
                  </button>
                  <span className="top-auth-pipe">|</span>
                  <button
                    type="button"
                    onClick={() => openAuthModal("admin")}
                    className="top-auth-btn top-admin-btn"
                  >
                    <i className="fa-solid fa-shield-halved"></i> Admin
                  </button>
                </>
              ) : (
                <span className="top-auth-logged">
                  {isAdmin ? "🛡️ Admin Portal" : `👤 ${user.name.split(" ")[0]}`}
                </span>
              )}
            </div>

            <button
              onClick={() => setShowAnnouncement(false)}
              className="announcement-close-btn"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Sticky Main Header */}
      <header className={`header-bg sticky-luxury-header gifting-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="container flex-header header gifting-header-container">
          {/* Brand Logo & Mobile Hamburger Trigger */}
          <div className="flex-title gifting-brand-wrapper">
            <button
              onClick={() => handleMouseClick(setMobileMenuShow)}
              className="btn-profile btn-search btn-hamburger"
              aria-label="Open mobile menu"
            >
              <i className="fa-solid fa-bars" style={{ fontSize: "18px" }}></i>
            </button>

            <Link to="/" className="luxury-brand-wordmark gifting-logo" aria-label="Giftingwellness Home">
              <img
                src="/giftingwellness-logo.png"
                alt="Giftingwellness Logo"
                className="brand-logo-img"
              />
              <div className="brand-logo-text-block">
                <span className="brand-logo-text">Giftingwellness</span>
                <span className="brand-logo-sub">
                  <span className="sub-dash">—</span> Corporate Gifting Solutions <span className="sub-dash">—</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Main Desktop Navigation Items */}
          <HeaderCategories
            onOpenBulkModal={handleOpenBulkModal}
            onOpenCatalogueModal={handleOpenCatalogueModal}
          />

          {/* Right Header Controls: Search, Saved Items, Cart, Account */}
          <HeaderProfileBtn
            handleMouseClick={() => handleMouseClick(setMobileSearchShow)}
            cart={cart}
            removeFromCart={removeFromCart}
            onOpenBulkModal={handleOpenBulkModal}
          />

          {/* Mobile Search Overlay */}
          <SearchMobile
            mobileSearchShow={mobileSearchShow}
            handleMouseClick={() => handleMouseClick(setMobileSearchShow)}
          />

          {/* Mobile Drawer Navigation */}
          <HamburgerMobile
            handleMouseClick={() => handleMouseClick(setMobileMenuShow)}
            mobileMenuShow={mobileMenuShow}
            onOpenBulkModal={handleOpenBulkModal}
            onOpenCatalogueModal={handleOpenCatalogueModal}
          />
        </div>
      </header>

      {/* Bulk Order Enquiry Modal with Login/Signup */}
      <BulkEnquiryModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        initialCategory={bulkInitialCategory}
      />

      {/* Catalogue Download Modal */}
      <CatalogueDownloadModal
        isOpen={catalogueModalOpen}
        onClose={() => setCatalogueModalOpen(false)}
      />
    </>
  );
};

export default Header;
