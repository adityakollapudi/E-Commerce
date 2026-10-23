import { Link } from "react-router-dom";
import { useSiteContent } from "../../context/SiteContentContext";

const BrandStorySection = () => {
  const { aboutUs } = useSiteContent();

  const whyChooseList = aboutUs?.whyChoose || [
    "Customised gifting solutions tailored to your brand.",
    "Options for different occasions and budgets.",
    "Thoughtfully curated and trending products.",
    "Bulk gifting support for corporate requirements.",
    "A focus on quality, presentation, and customer satisfaction.",
  ];

  return (
    <section id="brand-story" className="brand-story-section" aria-label="About Gifting Wellness">
      <div className="container brand-story-grid">
        {/* Left Column: Official Logo Badge & Corporate Packaging Photo */}
        <div className="brand-story-media">
          <div className="brand-story-img-container">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
              alt="Gifting Wellness Corporate Gifting Studio"
              className="brand-story-img"
              loading="lazy"
            />
            {/* Official Logo Floating Badge */}
            <div className="brand-story-logo-badge">
              <img
                src="/gifting-wellness-logo.jpg"
                alt="Gifting Wellness Official Logo"
                className="brand-story-logo-img"
              />
            </div>
            <div className="brand-story-caption">
              <span className="caption-year">FOUNDED 2019 · HYDERABAD, INDIA</span>
              <span className="caption-detail">Ravi Kinnera · Corporate Gifting Solutions</span>
            </div>
          </div>

          {/* Mission & Vision Quick Cards */}
          <div className="brand-mission-vision-grid">
            <div className="mission-card">
              <div className="mission-icon">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div>
                <h4 className="mission-title">Our Mission</h4>
                <p className="mission-desc">
                  {aboutUs?.mission ||
                    "To deliver innovative, high-quality, and personalized corporate gifting solutions that help businesses express appreciation, strengthen professional relationships, and celebrate success."}
                </p>
              </div>
            </div>

            <div className="vision-card">
              <div className="mission-icon">
                <i className="fa-solid fa-eye"></i>
              </div>
              <div>
                <h4 className="mission-title">Our Vision</h4>
                <p className="mission-desc">
                  {aboutUs?.vision ||
                    "To become a trusted corporate gifting partner for businesses across India by setting new standards in creativity, quality, personalisation, and customer satisfaction."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full About Us Story & Why Choose */}
        <div className="brand-story-content">
          <span className="section-kicker">About Us</span>
          <h2 className="brand-story-title title">
            {aboutUs?.title || "Gifting Wellness — Corporate Gifting Solutions"}
          </h2>

          <div className="brand-story-copy">
            {aboutUs?.lead && (
              <p className="brand-story-lead">
                {aboutUs.lead}
              </p>
            )}

            {(aboutUs?.paragraphs || []).map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}
          </div>

          {/* Why Choose Gifting Wellness? */}
          <div className="why-choose-container">
            <h3 className="why-choose-heading">
              <i className="fa-solid fa-award text--forest" style={{ marginRight: "8px" }}></i>
              Why Choose Gifting Wellness?
            </h3>
            <ul className="why-choose-list">
              {whyChooseList.map((item, idx) => (
                <li key={idx} className="why-choose-item">
                  <i className="fa-solid fa-circle-check text--forest"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Tagline Quote */}
          <div className="brand-tagline-strip">
            <i className="fa-solid fa-quote-left tagline-quote-icon"></i>
            <p className="brand-tagline-text">
              Gifting Wellness — Corporate Gifting Solutions. Thoughtfully Chosen. Meaningfully Delivered.
            </p>
          </div>

          <div className="brand-story-cta-row">
            <Link to={aboutUs?.buttonLink || "/products"} className="btn-luxury btn-primary brand-story-btn">
              {aboutUs?.buttonText || "Explore Corporate Catalog"} <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <a href="tel:+919876543210" className="btn-luxury btn-outline brand-story-btn">
              <i className="fa-solid fa-phone"></i> Contact Our Hyderabad HQ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
