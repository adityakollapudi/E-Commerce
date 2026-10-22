import HeroSection from "./HeroSection";
import TrustValueStrip from "./TrustValueStrip";
import FeaturedCategories from "./FeaturedCategories";
import HomeCategory from "./HomeCategory/HomeCategory";
import BrandStorySection from "./BrandStorySection";
import PromotionalBanner from "./PromotionalBanner";
import ShoppingReassurance from "./ShoppingReassurance";
import CustomerTestimonials from "./CustomerTestimonials";
import NewsletterSection from "./NewsletterSection";

const Home = () => {
  return (
    <main id="main-content" className="home-page luxury-storefront">
      {/* Section 03: Editorial Collage Hero */}
      <HeroSection />

      {/* Section 04: Trust and Value Strip */}
      <TrustValueStrip />

      {/* Section 05: Featured Collections (Find Your Everyday Essentials) */}
      <FeaturedCategories />

      {/* Section 06: Best Sellers (Considered Favourites) */}
      <section className="home-best-sellers-section" aria-label="Considered Favourites">
        <HomeCategory
          title="Considered Favourites"
          subtitle="Discover the pieces customers return to."
          filterType="bestSeller"
        />
      </section>

      {/* Section 08: Brand Story (Less, But Better) */}
      <BrandStorySection />

      {/* Section 09: Seasonal Campaign Banner (The New Season Edit) */}
      <PromotionalBanner />

      {/* Section 07: New Arrivals */}
      <section className="home-new-arrivals-section" aria-label="New Arrivals">
        <HomeCategory
          title="New Arrivals"
          subtitle="Fresh silhouettes and tactile textures recently welcomed to our catalog."
          filterType="newArrival"
        />
      </section>

      {/* Section 10: Shopping Reassurance & Policies */}
      <ShoppingReassurance />

      {/* Section 11: Customer Testimonials (Patron Reflections) */}
      <CustomerTestimonials />

      {/* Section 12: Newsletter (A Little Something Worth Opening) */}
      <NewsletterSection />
    </main>
  );
};

export default Home;
