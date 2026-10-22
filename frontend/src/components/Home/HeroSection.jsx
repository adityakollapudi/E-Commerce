import { Link } from "react-router-dom";

const HeroSection = () => {
  const scrollToStory = (e) => {
    e.preventDefault();
    const el = document.getElementById("brand-story");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-editorial-section" aria-label="Hero">
      <div className="container hero-editorial-grid">
        <div className="hero-editorial-content">
          <div className="hero-kicker">
            <span className="hero-kicker-dot"></span>
            <span className="hero-kicker-text">Autumn / Winter Atelier Collection</span>
          </div>

          <h1 className="hero-editorial-title">
            Designed for the Art of Everyday Living.
          </h1>

          <p className="hero-editorial-description">
            Meticulously crafted essentials, created with uncompromising attention to detail,
            pure natural textiles, and timeless silhouettes built for purposeful modern living.
          </p>

          <div className="hero-editorial-actions">
            <Link to="/products" className="btn-luxury btn-primary hero-primary-cta">
              Shop Collection <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <a
              href="#brand-story"
              onClick={scrollToStory}
              className="btn-luxury btn-outline hero-secondary-cta"
            >
              Explore Our Story
            </a>
          </div>

          <div className="hero-editorial-highlights">
            <div className="hero-highlight-item">
              <span className="highlight-number">100%</span>
              <span className="highlight-label">Pure Organic Textiles</span>
            </div>
            <div className="hero-highlight-divider"></div>
            <div className="hero-highlight-item">
              <span className="highlight-number">₹1,999+</span>
              <span className="highlight-label">Complimentary Shipping</span>
            </div>
            <div className="hero-highlight-divider"></div>
            <div className="hero-highlight-item">
              <span className="highlight-number">45k+</span>
              <span className="highlight-label">Discerning Patrons</span>
            </div>
          </div>
        </div>

        <div className="hero-editorial-media">
          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
              alt="Atelier luxury apparel editorial"
              className="hero-main-img"
              loading="eager"
            />
            <div className="hero-image-badge">
              <span className="badge-tag">Handcrafted Quality</span>
              <span className="badge-title">Timeless Cut & Finish</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
