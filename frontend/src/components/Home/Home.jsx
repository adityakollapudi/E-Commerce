import BrandsBreakLine from "../Misc/BrandsBreakLine";
import HomeCategory from "./HomeCategory/HomeCategory";
import PickCategorySquare from "./CategorySquares/PickCategorySquare";
import ReviewsCarousel from "./Reviews/ReviewsCarousel";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <main id="main-content" className="home-page">
      <section className="flex-home container">
        <div className="home-intro-description">
          <h2 className="title--lg">FIND CLOTHES THAT MATCH YOUR STYLES</h2>
          <p className="text--gray">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>
          <Link to="/products" className="btn-pill btn-black btn-intro">Shop Now</Link>
          <div className="company-stats-grid">
            <div>
              <p className="text--xl text--bold">200+</p>
              <p className="text--sm text--gray">International Brands</p>
            </div>
            <div>
              <p className="text--xl text--bold">2000+</p>
              <p className="text--sm text--gray">High-quality Products</p>
            </div>
            <div>
              <p className="text--xl text--bold">30000+</p>
              <p className="text--sm text--gray">Happy Customers</p>
            </div>
          </div>
        </div>
        <div className="intro-bg"></div>
      </section>
      <BrandsBreakLine />
      <section className=" home-categories">
        <HomeCategory title="New Arrivals" category="men's clothing" />
        <hr className=" category-hr" />
        <HomeCategory title="Best Sellers" category="women's clothing" />
      </section>

      {/* Corporate Gifting Spotlight Section */}
      <section className="container corporate-spotlight-section">
        <div className="corporate-spotlight-card">
          <div className="spotlight-content">
            <span className="spotlight-badge">
              <i className="fa-solid fa-building"></i> B2B Corporate Gifting & Merch
            </span>
            <h2 className="title--lg spotlight-title">
              UG Elixir Plus Cork Base Mug
            </h2>
            <p className="spotlight-desc">
              Looking for premium promotional executive gifts? The Urban Gear UGDB65 combines food-grade glazed ceramic with an eco-friendly insulating cork bottom that protects desktops. Custom company logo branding available via digital UV, screen printing, or laser engraving.
            </p>
            <div className="spotlight-perks">
              <div className="spotlight-perk-item">
                <i className="fa-solid fa-receipt text-green"></i>
                <span>18% GST Tax Invoice</span>
              </div>
              <div className="spotlight-perk-item">
                <i className="fa-solid fa-boxes-stacked text-blue"></i>
                <span>MOQ 100 pcs · Tiered Pricing</span>
              </div>
              <div className="spotlight-perk-item">
                <i className="fa-solid fa-palette text-purple"></i>
                <span>Free Digital Logo Proof</span>
              </div>
            </div>
            <div className="spotlight-ctas">
              <Link to="/products/drinkware/1120677" className="btn-pill btn-black">
                View UGDB65 Details (₹338) →
              </Link>
              <Link to="/products?category=drinkware" className="btn-pill btn-white">
                All Drinkware Catalog
              </Link>
            </div>
          </div>
          <div className="spotlight-media">
            <Link to="/products/drinkware/1120677">
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                alt="UG Elixir Plus Cork Base Ceramic Mug"
                className="spotlight-img"
              />
              <span className="spotlight-img-badge">Urban Gear · SKU UGDB65</span>
            </Link>
          </div>
        </div>
      </section>

      <PickCategorySquare />
      <ReviewsCarousel />
    </main>
  );
};

export default Home;
