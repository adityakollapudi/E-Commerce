import { Link } from "react-router-dom";

const PromotionalBanner = () => {
  return (
    <section className="promotional-campaign-section" aria-label="Campaign Promotion">
      <div className="container">
        <div className="promotional-banner-card">
          <div className="promotional-banner-content">
            <span className="banner-kicker">Limited Capsule</span>
            <h2 className="banner-headline">The New Season Edit</h2>
            <p className="banner-subtext">
              An exploration of tactile earth tones, architectural outerwear, and pure organic textures
              designed for effortless layering through crisp mornings and cool evenings.
            </p>
            <div className="banner-cta-group">
              <Link to="/products?new=true" className="btn-luxury btn-banner-primary">
                Shop the Edit <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <span className="banner-shipping-hint">
                <i className="fa-solid fa-truck-fast"></i> Complimentary shipping on all orders over ₹1,999
              </span>
            </div>
          </div>
          <div className="promotional-banner-media">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80"
              alt="The New Season Edit editorial"
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
