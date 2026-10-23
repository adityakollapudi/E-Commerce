import { Link } from "react-router-dom";

const BrandStorySection = () => {
  return (
    <section id="brand-story" className="brand-story-section" aria-label="Why Atelier Gifting">
      <div className="container brand-story-grid">
        <div className="brand-story-media">
          <div className="brand-story-img-container">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
              alt="Atelier bespoke corporate gift packaging and unboxing studio"
              className="brand-story-img"
              loading="lazy"
            />
            <div className="brand-story-caption">
              <span className="caption-year">ATELIER B2B LAB</span>
              <span className="caption-detail">Custom Gift Packaging & Precision Engraving</span>
            </div>
          </div>
        </div>

        <div className="brand-story-content">
          <span className="section-kicker">Corporate Partnership</span>
          <h2 className="brand-story-title title">Gifts That Build Real Connections.</h2>

          <div className="brand-story-copy">
            <p className="brand-story-lead">
              We believe corporate gifting shouldn’t feel like cheap disposable giveaways. 
              A truly thoughtful gift strengthens relationships, honors team milestones, and leaves an enduring impression.
            </p>
            <p>
              Atelier Gifting Solutions partners directly with enterprises, HR directors, and event coordinators 
              across India. From temperature-controlled vacuum drinkware and handcrafted diaries to authorized 
              audio tech from JBL, boAt, and Cross, we curate collections that recipients genuinely cherish and use every single day.
            </p>
          </div>

          <div className="brand-story-pillars">
            <div className="pillar-item">
              <div className="pillar-icon">
                <i className="fa-solid fa-stamp"></i>
              </div>
              <div className="pillar-text">
                <h4>Flawless Brand Co-Branding</h4>
                <p>Digital UV color printing, high-precision laser engraving, and blind debossing aligned with your brand guidelines.</p>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon">
                <i className="fa-solid fa-truck-ramp-box"></i>
              </div>
              <div className="pillar-text">
                <h4>Pan-India Direct-to-Door Fulfillment</h4>
                <p>Send 50 or 5,000 gifts seamlessly to consolidated headquarters or individually to remote team members across India.</p>
              </div>
            </div>
          </div>

          <div className="brand-story-cta-row">
            <Link to="/products" className="btn-luxury btn-outline brand-story-btn">
              Explore Corporate Catalog <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
