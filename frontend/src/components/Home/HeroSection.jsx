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
    <section className="hero-editorial-section" aria-label="Editorial Hero">
      <div className="container hero-editorial-grid">
        {/* Left Region: Editorial Typography & Actions */}
        <div className="hero-editorial-content">
          <div className="hero-kicker">
            <span className="hero-kicker-dot"></span>
            <span className="hero-kicker-text">Edition 2026 · Autumn / Winter</span>
          </div>

          <h1 className="hero-editorial-title">
            Designed for the Art of Everyday Living.
          </h1>

          <p className="hero-editorial-description">
            Thoughtful essentials, considered materials, and timeless design for the way you live.
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
              Discover Our Story
            </a>
          </div>

          <div className="hero-editorial-highlights">
            <div className="hero-highlight-item">
              <span className="highlight-number">100%</span>
              <span className="highlight-label">Natural Fibres</span>
            </div>
            <div className="hero-highlight-divider" aria-hidden="true"></div>
            <div className="hero-highlight-item">
              <span className="highlight-number">₹1,999+</span>
              <span className="highlight-label">Complimentary Shipping</span>
            </div>
            <div className="hero-highlight-divider" aria-hidden="true"></div>
            <div className="hero-highlight-item">
              <span className="highlight-number">30-Day</span>
              <span className="highlight-label">Hassle-Free Returns</span>
            </div>
          </div>
        </div>

        {/* Right Region: Asymmetric Editorial Collage */}
        <div className="hero-editorial-media">
          <div className="hero-collage-container">
            {/* Dominant Lifestyle Anchor Image */}
            <div className="hero-image-wrapper hero-anchor-image">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                alt="Atelier collection editorial model in relaxed tailored coat"
                className="hero-main-img"
                loading="eager"
              />
              <div className="hero-image-badge">
                <span className="badge-tag">Atelier Silhouette</span>
                <span className="badge-title">Cut from Pure Natural Wool</span>
              </div>
            </div>

            {/* Supporting Detail Image Crop */}
            <div className="hero-supporting-crop" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"
                alt="Tactile knit detail and honest seam finish"
                className="hero-sub-img"
                loading="lazy"
              />
              <span className="hero-supporting-caption">
                Tactile Knit · Studio No. 04
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
