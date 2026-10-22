import HeaderCategories from "./HeaderCategories";
import SearchMobile from "./SearchMobile";
import HeaderProfileBtn from "./HeaderProfileBtn";
import HamburgerMobile from "./HamburgerMobile";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = ({ cart, removeFromCart }) => {
  const { user, isAdmin, openAuthModal } = useAuth();
  const [dropdownShow, setDropdownShow] = useState(false);
  const [mobileSearchShow, setMobileSearchShow] = useState(false);
  const [mobileMenuShow, setMobileMenuShow] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleMouseIn = () => {
    setDropdownShow("active");
  };

  const handleMouseOut = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropdownShow("");
    }
  };

  return (
    <>
      <a className="sr-only" href="#main-content">
        Skip to main content
      </a>

      {showAnnouncement && (
        <div className="top-announcement-bar">
          <div className="container top-announcement-content">
            <p className="announcement-text">
              Complimentary shipping on orders above ₹1,999.{" "}
              <Link to="/products" className="announcement-link">
                Use code <strong>SHOP20</strong> for 20% off
              </Link>
            </p>

            <div className="top-auth-actions">
              {!user ? (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal("user")}
                    className="top-auth-btn"
                  >
                    <i className="fa-regular fa-user"></i> Customer Login
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

      <header className={`header-bg sticky-luxury-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="container flex-header header">
          <div className="flex-title">
            <button
              onClick={() => handleMouseClick(setMobileMenuShow)}
              className="btn-profile btn-search btn-hamburger"
              aria-label="Open mobile menu"
            >
              <i className="fa-solid fa-bars" style={{ fontSize: "18px" }}></i>
            </button>
            <Link to="/" className="luxury-brand-wordmark" aria-label="Atelier Home">
              <span className="brand-logo-text">ATELIER</span>
              <span className="brand-logo-sub">& CO.</span>
            </Link>
          </div>

          <HeaderCategories
            handleMouseIn={handleMouseIn}
            dropdownShow={dropdownShow}
            handleMouseOut={handleMouseOut}
          />

          <HeaderProfileBtn
            handleMouseClick={() => handleMouseClick(setMobileSearchShow)}
            cart={cart}
            removeFromCart={removeFromCart}
          />

          <SearchMobile
            mobileSearchShow={mobileSearchShow}
            handleMouseClick={() => handleMouseClick(setMobileSearchShow)}
          />

          <HamburgerMobile
            handleMouseClick={() => handleMouseClick(setMobileMenuShow)}
            mobileMenuShow={mobileMenuShow}
          />
        </div>
      </header>
    </>
  );
};

export default Header;
