import { Link } from "react-router-dom";

const COLLECTIONS = [
  {
    id: "everyday-essentials",
    title: "Everyday Essentials",
    description: "Foundational wardrobe pieces, breathable organic cotton tees, and relaxed trousers designed for effortless daily comfort.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
    link: "/products?style=casual",
    tag: "Foundational Pieces",
    isLarge: true,
  },
  {
    id: "signature-tailoring",
    title: "Signature Tailoring",
    description: "Architectural blazers and refined cuts crafted from structured virgin wool twill.",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
    link: "/products?style=formal",
    tag: "Refined Cuts",
    isLarge: false,
  },
  {
    id: "new-arrivals",
    title: "New Season Arrivals",
    description: "Tactile textures, earth tones, and lightweight overshirts tailored for seasonal transition.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    link: "/products?new=true",
    tag: "Just Landed",
    isLarge: false,
  },
  {
    id: "living-accessories",
    title: "Considered Objects",
    description: "Glazed ceramic drinkware and cork-insulated travel mugs engineered for daily ritual.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    link: "/products?category=drinkware",
    tag: "Daily Ritual",
    isLarge: false,
  },
];

const FeaturedCategories = () => {
  return (
    <section className="featured-categories-section" aria-label="Featured Collections">
      <div className="container">
        <div className="section-header-editorial">
          <span className="section-kicker">Curated Chapters</span>
          <h2 className="section-title-editorial title">Find Your Everyday Essentials.</h2>
          <p className="section-subtitle-editorial">
            Explore considered pieces for the moments that matter.
          </p>
        </div>

        {/* Asymmetric Editorial Grid: 1 Large Anchor Tile + 3 Supporting Tiles */}
        <div className="categories-asymmetric-grid">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              to={col.link}
              className={`collection-tile-card ${col.isLarge ? "tile-featured-large" : "tile-supporting"}`}
            >
              <div className="collection-tile-media">
                <img
                  src={col.image}
                  alt={col.title}
                  loading="lazy"
                  className="collection-tile-img"
                />
                <div className="collection-tile-gradient"></div>
              </div>

              <div className="collection-tile-content">
                <span className="collection-tile-tag">{col.tag}</span>
                <h3 className="collection-tile-title">{col.title}</h3>
                <p className="collection-tile-desc">{col.description}</p>
                <span className="collection-tile-cta">
                  Explore Collection <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
