import { Link } from "react-router-dom";
import { useSiteContent } from "../../context/SiteContentContext";

const BrandStorySection = () => {
  const { aboutUs } = useSiteContent();

  return (
    <section id="brand-story" className="brand-story-section" aria-label="Why Atelier Gifting">
      <div className="container brand-story-grid">
        <div className="brand-story-media">
          <div className="brand-story-img-container">
            <img
              src={aboutUs.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"}
              alt="Atelier bespoke corporate gift packaging and unboxing studio"
              className="brand-story-img"
              loading="lazy"
            />
            <div className="brand-story-caption">
              <span className="caption-year">{aboutUs.captionYear || "ATELIER B2B LAB"}</span>
              <span className="caption-detail">{aboutUs.captionDetail || "Custom Gift Packaging & Precision Engraving"}</span>
            </div>
          </div>
        </div>

        <div className="brand-story-content">
          <span className="section-kicker">{aboutUs.kicker || "Corporate Partnership"}</span>
          <h2 className="brand-story-title title">{aboutUs.title || "Gifts That Build Real Connections."}</h2>

          <div className="brand-story-copy">
            {aboutUs.lead && (
              <p className="brand-story-lead">
                {aboutUs.lead}
              </p>
            )}
            {(aboutUs.paragraphs || []).map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}
          </div>

          <div className="brand-story-pillars">
            {(aboutUs.pillars || []).map((pillar) => (
              <div key={pillar.id} className="pillar-item">
                <div className="pillar-icon">
                  <i className={pillar.icon || "fa-solid fa-stamp"}></i>
                </div>
                <div className="pillar-text">
                  <h4>{pillar.title}</h4>
                  <p>{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="brand-story-cta-row">
            <Link to={aboutUs.buttonLink || "/products"} className="btn-luxury btn-outline brand-story-btn">
              {aboutUs.buttonText || "Explore Corporate Catalog"} <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
