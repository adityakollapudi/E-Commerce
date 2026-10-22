import StarRating from "./Reviews/StarRating";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    location: "Mumbai",
    rating: 5,
    title: "Unmatched fabric feel & tailoring",
    comment:
      "The weight and drape of the virgin wool overcoat exceeded my highest expectations. It hangs with the poise of bespoke Savile Row tailoring. Truly an investment piece.",
    item: "Signature Wool Overcoat",
    verified: true,
  },
  {
    id: 2,
    name: "Priya Nair",
    location: "Bangalore",
    rating: 5,
    title: "Quiet luxury done right",
    comment:
      "Subtle, breathable, and beautifully minimal. No loud logos—just immaculate stitching and tactile luxury. Delivery arrived in two days in pristine sustainable packaging.",
    item: "Organic Linen Relaxed Shirt",
    verified: true,
  },
  {
    id: 3,
    name: "Devika Patel",
    location: "New Delhi",
    rating: 5,
    title: "Timeless silhouette",
    comment:
      "I have worn this silk-cotton knit every week for three months. It hasn't lost an ounce of shape after hand washing. A rare masterclass in honest garment construction.",
    item: "Atelier Classic Knit",
    verified: true,
  },
];

const CustomerTestimonials = () => {
  return (
    <section className="testimonials-editorial-section" aria-label="Customer Testimonials">
      <div className="container">
        <div className="section-header-editorial">
          <span className="section-kicker">Patron Voices</span>
          <h2 className="section-title-editorial title">Stories of Enduring Quality</h2>
          <p className="section-subtitle-editorial">
            Authentic reflections from discerning collectors and patrons across India.
          </p>
        </div>

        <div className="testimonials-editorial-grid">
          {TESTIMONIALS.map((t) => (
            <article key={t.id} className="testimonial-card-editorial">
              <div className="testimonial-rating-row">
                <StarRating rating={t.rating} />
                {t.verified && (
                  <span className="testimonial-verified-badge">
                    <i className="fa-solid fa-circle-check"></i> Verified Patron
                  </span>
                )}
              </div>

              <h3 className="testimonial-headline">"{t.title}"</h3>
              <p className="testimonial-body">{t.comment}</p>

              <div className="testimonial-footer">
                <div className="testimonial-author-avatar">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="testimonial-author-name">{t.name}</h4>
                  <p className="testimonial-author-meta">
                    {t.location} • Purchased <em>{t.item}</em>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
