import { Link } from "react-router-dom";

const CATEGORIES = [
  {
    id: "everyday",
    title: "Everyday Essentials",
    description: "Relaxed silhouettes and elevated wardrobe cornerstones",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    link: "/products?style=casual",
    tag: "Wardrobe Foundation",
  },
  {
    id: "signature",
    title: "Signature Collection",
    description: "Architectural tailoring cut from fine virgin wool & silk blends",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
    link: "/products?style=formal",
    tag: "Refined Tailoring",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    description: "Fresh textural palette designed for seasonal transition",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    link: "/products?new=true",
    tag: "Just Landed",
  },
  {
    id: "best-sellers",
    title: "Best Sellers",
    description: "Our community's most celebrated and reordered styles",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    link: "/products",
    tag: "Patron Favorites",
  },
];

const FeaturedCategories = () => {
  return (
    <section className="featured-categories-section" aria-label="Featured Collections">
      <div className="container">
        <div className="section-header-editorial">
          <span className="section-kicker">Curated Edits</span>
          <h2 className="section-title-editorial title">Featured Collections</h2>
          <p className="section-subtitle-editorial">
            Discover curated chapters of intentional silhouettes and master craftsmanship.
          </p>
        </div>

        <div className="categories-grid-editorial">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="category-card-editorial"
            >
              <div className="category-card-media">
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="category-card-img"
                />
                <div className="category-card-overlay"></div>
              </div>
              <div className="category-card-content">
                <span className="category-card-tag">{cat.tag}</span>
                <h3 className="category-card-title">{cat.title}</h3>
                <p className="category-card-desc">{cat.description}</p>
                <span className="category-card-link-text">
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
