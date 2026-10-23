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
            <span className="hero-kicker-text">Edition 2026 · Corporate & Festive Gifting</span>
          </div>

          <h1 className="hero-editorial-title">
            Bespoke Hampers, Tech Kits & Branded Gifts.
          </h1>

          <p className="hero-editorial-description">
            Tailored corporate gifting, employee onboarding kits, festive hampers, and authorized branded merchandise with custom logo printing, official GST tax billing, and Pan-India delivery.
          </p>

          <div className="hero-editorial-actions">
            <Link to="/products" className="btn-luxury btn-primary hero-primary-cta">
              Explore Gifting Catalog <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <a
              href="#brand-story"
              onClick={scrollToStory}
              className="btn-luxury btn-outline hero-secondary-cta"
            >
              Why Giftingwellness
            </a>
          </div>

          <div className="hero-editorial-highlights">
            <div className="hero-highlight-item">
              <span className="highlight-number">10,000+</span>
              <span className="highlight-label">Curated Gift Items</span>
            </div>
            <div className="hero-highlight-divider" aria-hidden="true"></div>
            <div className="hero-highlight-item">
              <span className="highlight-number">100%</span>
              <span className="highlight-label">Custom Logo Branding</span>
            </div>
            <div className="hero-highlight-divider" aria-hidden="true"></div>
            <div className="hero-highlight-item">
              <span className="highlight-number">Pan-India</span>
              <span className="highlight-label">Doorstep Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Region: Asymmetric Editorial Collage */}
        <div className="hero-editorial-media">
          <div className="hero-collage-container">
            {/* Dominant Lifestyle Anchor Image */}
            <div className="hero-image-wrapper hero-anchor-image">
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85"
                alt="Atelier luxury corporate gift hamper box with bespoke packaging"
                className="hero-main-img"
                loading="eager"
              />
              <div className="hero-image-badge">
                <span className="badge-tag">Corporate Hamper Edition</span>
                <span className="badge-title">Custom Logo Engraved & Gift Boxed</span>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
