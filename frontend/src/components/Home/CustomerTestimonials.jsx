import StarRating from "./Reviews/StarRating";

// Sample feedback for development demonstration (replace with real review integration in production)
const SAMPLE_TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    location: "Mumbai",
    rating: 5,
    title: "Unmatched fabric feel & tailoring",
    comment:
      "The weight and drape of the virgin wool overcoat exceeded my expectations. It hangs with genuine structure and poise. Truly an investment piece.",
    item: "Tailored Tailcoat Formal Blazer",
  },
  {
    id: 2,
    name: "Priya Nair",
    location: "Bangalore",
    rating: 5,
    title: "Quiet luxury done right",
    comment:
      "Subtle, breathable, and beautifully minimal. No loud logos—just immaculate stitching and tactile comfort. Delivery arrived in two days in pristine kraft packaging.",
    item: "T-shirt with Tape Details",
  },
  {
    id: 3,
    name: "Devika Patel",
    location: "New Delhi",
    rating: 5,
    title: "Timeless silhouette",
    comment:
      "I have worn this knit regularly for months. It hasn't lost shape after washing. A wonderful example of honest garment construction.",
    item: "Elegant Velvet Evening Dress",
  },
];

const CustomerTestimonials = () => {
  return (
    <section className="testimonials-editorial-section" aria-label="Customer Reflections">
      <div className="container">
        <div className="section-header-editorial">
          <span className="section-kicker">Patron Reflections</span>
          <h2 className="section-title-editorial title">Stories of Enduring Quality</h2>
          <p className="section-subtitle-editorial">
            Sample feedback highlighting materials, comfort, and everyday durability.
          </p>
        </div>

        <div className="testimonials-editorial-grid">
          {SAMPLE_TESTIMONIALS.map((t) => (
            <article key={t.id} className="testimonial-card-editorial">
              <div className="testimonial-rating-row">
                <StarRating rating={t.rating} />
                <span className="testimonial-sample-tag">Sample Feedback</span>
              </div>

              <h3 className="testimonial-headline">"{t.title}"</h3>
              <p className="testimonial-body">{t.comment}</p>

              <div className="testimonial-footer">
                <div className="testimonial-author-avatar" aria-hidden="true">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4 className="testimonial-author-name">{t.name}</h4>
                  <p className="testimonial-author-meta">
                    {t.location} · Regarding <em>{t.item}</em>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Development Note */}
        <p className="testimonials-disclaimer-note">
          <i className="fa-solid fa-circle-info"></i> Note: Testimonials shown above represent sample content for layout demonstration purposes.
        </p>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
