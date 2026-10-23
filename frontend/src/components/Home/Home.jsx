import HeroSection from "./HeroSection";
import TrustValueStrip from "./TrustValueStrip";
import GiftingServicesSection from "./GiftingServicesSection";
import FeaturedCategories from "./FeaturedCategories";
import HomeCategory from "./HomeCategory/HomeCategory";
import BrandedGiftingShowcase from "./BrandedGiftingShowcase";
import BrandStorySection from "./BrandStorySection";
import PromotionalBanner from "./PromotionalBanner";
import ShoppingReassurance from "./ShoppingReassurance";
import CustomerTestimonials from "./CustomerTestimonials";
import NewsletterSection from "./NewsletterSection";

const Home = () => {
  return (
    <main id="main-content" className="home-page luxury-storefront">
      {/* 01: Hero Section - Bespoke Hampers, Tech Kits & Branded Gifts */}
      <HeroSection />

      {/* 02: Trust & Value Strip - Logo Branding, B2B GST, Pan-India Logistics, Volume Pricing */}
      <TrustValueStrip />

      {/* 03: Four Bespoke Services - Corporate, Employee, Return, Event Gifting */}
      <GiftingServicesSection />

      {/* 04: Core Gifting Categories - Drinkware, Bags, Tech, Festive */}
      <FeaturedCategories />

      {/* 05: Trending Corporate Bestsellers */}
      <section className="home-best-sellers-section" aria-label="Trending Corporate Bestsellers">
        <HomeCategory
          title="Trending Corporate Bestsellers"
          subtitle="Handpicked executive drinkware, onboarding kits, and custom-branded gifts."
          filterType="bestSeller"
        />
      </section>

      {/* 06: Authorized 22+ Corporate Brand Partners */}
      <BrandedGiftingShowcase />

      {/* 07: Why 500+ Corporate Brands Partner With Giftingwellness */}
      <BrandStorySection />

      {/* 08: Seasonal & Festive Gifting Campaign Banner */}
      <PromotionalBanner />

      {/* 09: New Season Gifting Arrivals */}
      <section className="home-new-arrivals-section" aria-label="New Gifting Arrivals">
        <HomeCategory
          title="New Season Gifting Arrivals"
          subtitle="Innovative tech gadgets, insulated drinkware, and sustainable gift sets recently added."
          filterType="newArrival"
        />
      </section>

      {/* 10: Enterprise Assurance & Corporate Policies */}
      <ShoppingReassurance />

      {/* 11: Verified Client Reflections & Testimonials */}
      <CustomerTestimonials />

      {/* 12: Corporate Lookbook 2026 Subscription */}
      <NewsletterSection />
    </main>
  );
};

export default Home;
