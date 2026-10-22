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

      <PickCategorySquare />
      <ReviewsCarousel />
    </main>
  );
};

export default Home;
