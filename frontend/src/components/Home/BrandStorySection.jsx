import { Link } from "react-router-dom";

const BrandStorySection = () => {
  return (
    <section id="brand-story" className="brand-story-section" aria-label="Brand Story">
      <div className="container brand-story-grid">
        <div className="brand-story-media">
          <div className="brand-story-img-container">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
              alt="Atelier craft and textile studio"
              className="brand-story-img"
              loading="lazy"
            />
            <div className="brand-story-caption">
              <span className="caption-year">EST. 2024</span>
              <span className="caption-detail">Milanese Design & Artisan Hand-Finish</span>
            </div>
          </div>
        </div>

        <div className="brand-story-content">
          <span className="section-kicker">Philosophy & Heritage</span>
          <h2 className="brand-story-title title">Less, But Better.</h2>
          
          <div className="brand-story-copy">
            <p>
              We believe in the power of conscious restraint. In a world saturated with ephemeral trends
              and disposable fashion, our purpose is singular: to create pieces of enduring beauty,
              uncompromising craftsmanship, and effortless comfort.
            </p>
            <p>
              Every garment begins with natural fibres sourced from certified ethical mills—organic Aegean
              cottons, tactile linens, and supple virgin wools. Cut with surgical precision and finished
              by skilled master tailors, our garments are engineered to look better with each passing year.
            </p>
          </div>

          <div className="brand-story-values">
            <div className="value-item">
              <i className="fa-solid fa-leaf"></i>
              <div>
                <h4>Zero-Waste Patterning</h4>
                <p>Thoughtful cutting techniques minimizing excess fabric</p>
              </div>
            </div>
            <div className="value-item">
              <i className="fa-solid fa-gem"></i>
              <div>
                <h4>Generational Durability</h4>
                <p>Reinforced twin-needle stitching and robust natural buttons</p>
              </div>
            </div>
          </div>

          <div className="brand-story-cta-row">
            <Link to="/underconstruction" className="brand-story-link">
              Discover Our Story <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
