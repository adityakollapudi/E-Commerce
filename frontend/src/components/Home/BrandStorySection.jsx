import { Link } from "react-router-dom";

const BrandStorySection = () => {
  return (
    <section id="brand-story" className="brand-story-section" aria-label="Brand Story">
      <div className="container brand-story-grid">
        <div className="brand-story-media">
          <div className="brand-story-img-container">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
              alt="Atelier craft and textile design studio"
              className="brand-story-img"
              loading="lazy"
            />
            <div className="brand-story-caption">
              <span className="caption-year">ATELIER ARCHIVE</span>
              <span className="caption-detail">Milanese Design & Artisan Hand-Finish</span>
            </div>
          </div>
        </div>

        <div className="brand-story-content">
          <span className="section-kicker">Design Philosophy</span>
          <h2 className="brand-story-title title">Less, But Better.</h2>

          <div className="brand-story-copy">
            <p className="brand-story-lead">
              We believe everyday objects should earn their place. Thoughtful details,
              considered materials, and timeless forms make the ordinary feel exceptional.
            </p>
            <p>
              In contrast to the cycle of disposable fast trends, our studio approaches every piece
              as a long-term companion. From breathable natural cottons and tactile linen weaves to
              precision hardware and double-turn hems, we construct garments and daily objects that
              wear gracefully over time.
            </p>
          </div>

          <div className="brand-story-pillars">
            <div className="pillar-item">
              <div className="pillar-icon">
                <i className="fa-solid fa-compass-drafting"></i>
              </div>
              <div className="pillar-text">
                <h4>Intentional Silhouette</h4>
                <p>Proportions tested and balanced for ease of movement and enduring aesthetic longevity.</p>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon">
                <i className="fa-solid fa-feather-pointed"></i>
              </div>
              <div className="pillar-text">
                <h4>Honest Craftsmanship</h4>
                <p>Reinforced seam construction and durable natural textiles selected for daily utility.</p>
              </div>
            </div>
          </div>

          <div className="brand-story-cta-row">
            <Link to="/underconstruction" className="btn-luxury btn-outline brand-story-btn">
              Discover Our Story <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
