import { Link } from "react-router-dom";

const PromotionalBanner = () => {
  return (
    <section className="promotional-campaign-section" aria-label="Seasonal Campaign">
      <div className="container">
        <div className="promotional-banner-card">
          <div className="promotional-banner-content">
            <span className="banner-kicker">Autumn / Winter Capsule</span>
            <h2 className="banner-headline">The New Season Edit.</h2>
            <p className="banner-subtext">
              Fresh perspectives on the pieces you live with every day.
            </p>
            <div className="banner-cta-group">
              <Link to="/products?new=true" className="btn-luxury btn-banner-primary">
                Explore the Edit <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <span className="banner-shipping-hint">
                <i className="fa-solid fa-truck-fast"></i> Complimentary shipping on orders above ₹1,999
              </span>
            </div>
          </div>
          <div className="promotional-banner-media">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85"
              alt="The New Season Edit lifestyle apparel"
              className="banner-media-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;
