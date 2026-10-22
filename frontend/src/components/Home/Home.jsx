import HeroSection from "./HeroSection";
import FeaturedCategories from "./FeaturedCategories";
import HomeCategory from "./HomeCategory/HomeCategory";
import BrandStorySection from "./BrandStorySection";
import PromotionalBanner from "./PromotionalBanner";
import CustomerTestimonials from "./CustomerTestimonials";
import NewsletterSection from "./NewsletterSection";

const Home = () => {
  return (
    <main id="main-content" className="home-page luxury-storefront">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Image-Led Categories */}
      <FeaturedCategories />

      {/* 3. Best Sellers / Signature Pieces Grid */}
      <section className="home-best-sellers-section">
        <HomeCategory
          title="Curated Best Sellers"
          subtitle="Celebrated by our community for timeless silhouettes and impeccable hand-finish."
          category="men's clothing"
        />
      </section>

      {/* 4. Brand Story: Less, But Better */}
      <BrandStorySection />

      {/* 5. Promotional Campaign Banner: The New Season Edit */}
      <PromotionalBanner />

      {/* 6. New Season Arrivals Grid */}
      <section className="home-new-arrivals-section">
        <HomeCategory
          title="New Arrivals"
          subtitle="Tactile textures and earth tones tailored for effortless seasonal transition."
          category="women's clothing"
        />
      </section>

      {/* 7. Patron Testimonials */}
      <CustomerTestimonials />

      {/* 8. Editorial Newsletter Subscription */}
      <NewsletterSection />
    </main>
  );
};

export default Home;
