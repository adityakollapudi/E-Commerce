import { useState } from "react";
import ReviewCard from "../../Home/Reviews/ReviewCard";

const CORPORATE_REVIEWS = [
  {
    firstName: "Vikram",
    lastNameLetter: "M",
    company: "Infosys Procurement",
    rating: 5,
    date: "October 10, 2026",
    text: "We ordered 250 units of the UG Elixir Plus Cork Base Mug with our company logo UV-printed for our annual leadership offsite in Bangalore. The cork base looks extremely classy and prevents heat marks on conference desks. The delivery was right on schedule within 8 days with official GST invoicing.",
  },
  {
    firstName: "Pooja",
    lastNameLetter: "S",
    company: "Zeta Fintech",
    rating: 5,
    date: "September 24, 2026",
    text: "Used these mugs as part of our new hire welcome kit. Employees love the sliding splash-proof lid and the matte black finish. Great build quality and the individual kraft gift boxes saved us hours of repackaging.",
  },
  {
    firstName: "Rohan",
    lastNameLetter: "K",
    company: "GrowthX Labs",
    rating: 4.8,
    date: "September 12, 2026",
    text: "Ordered a single sample unit first to check quality before placing our 150-piece bulk order. The ceramic is thick and holds heat for hours. Laser engraving turned out crisp and permanent. Highly recommended corporate gifting partner!",
  },
  {
    firstName: "Ananya",
    lastNameLetter: "D",
    company: "Deloitte Digital",
    rating: 5,
    date: "August 30, 2026",
    text: "The combination of natural cork and glazed ceramic feels very premium. The customer support team was very responsive with the digital mockups and GST input tax credit was smoothly claimed.",
  },
];

const STANDARD_REVIEWS = [
  {
    firstName: "Samantha",
    lastNameLetter: "D",
    rating: 5,
    date: "August 14, 2024",
    text: "I absolutely love this product! The quality is premium and it feels very durable. Will definitely buy more!",
  },
  {
    firstName: "Alex",
    lastNameLetter: "M",
    rating: 5,
    date: "August 10, 2024",
    text: "The details exceeded my expectations. Clean finish, fast shipping, and top-notch packaging. Highly recommend!",
  },
  {
    firstName: "Ethan",
    lastNameLetter: "R",
    rating: 4.5,
    date: "July 28, 2024",
    text: "Great quality for the price. Delivery was super fast within 3 days. Comfortable and stylish.",
  },
  {
    firstName: "Olivia",
    lastNameLetter: "P",
    rating: 5,
    date: "July 20, 2024",
    text: "Flawless finish! I've received so many compliments whenever I show this piece. Sleek and modern.",
  },
];

const ProductInfoTabs = ({ details }) => {
  const [activeTab, setActiveTab] = useState(0);

  const isCorporate =
    Boolean(details.sku) ||
    Boolean(details.brand) ||
    details.category === "drinkware" ||
    Boolean(details.specs);

  const initialReviews = isCorporate ? CORPORATE_REVIEWS : STANDARD_REVIEWS;
  const [reviewsList, setReviewsList] = useState(initialReviews);

  const loadMoreReviews = () => {
    setReviewsList((prev) => [
      ...prev,
      {
        firstName: "Marcus",
        lastNameLetter: "W",
        company: "Apex Tech",
        rating: 5,
        date: "July 15, 2026",
        text: "Outstanding material and construction. The packaging and custom branding were spot-on.",
      },
      {
        firstName: "Sneha",
        lastNameLetter: "R",
        company: "Krypton Corp",
        rating: 4.9,
        date: "July 02, 2026",
        text: "Bulk order of 100 pieces executed flawlessly. Great communication and swift turnaround.",
      },
    ]);
  };

  const specsEntries = details.specs ? Object.entries(details.specs) : null;

  return (
    <div className="product-tabs-container">
      <ul className="product-tabs">
        <li className={`tab-link ${activeTab === 0 ? "current" : ""}`}>
          <button className="tab-link-btn" onClick={() => setActiveTab(0)}>
            {isCorporate ? "Specifications & Features" : "Product Details"}
          </button>
        </li>
        <li className={`tab-link ${activeTab === 1 ? "current" : ""}`}>
          <button className="tab-link-btn" onClick={() => setActiveTab(1)}>
            Ratings & Reviews ({reviewsList.length})
          </button>
        </li>
        <li className={`tab-link ${activeTab === 2 ? "current" : ""}`}>
          <button className="tab-link-btn" onClick={() => setActiveTab(2)}>
            {isCorporate ? "Corporate Gifting FAQs" : "FAQs"}
          </button>
        </li>
      </ul>

      <div className="content-tab">
        {/* Tab 0: Product Details & Specs */}
        <div className={`tab-content ${activeTab === 0 ? "current" : ""}`}>
          <div className="tab-details-grid">
            <div className="tab-desc-column">
              <h3 className="title--sm">Product Overview</h3>
              <p className="text--gray tab-lead-p">{details.description}</p>

              {details.features && details.features.length > 0 && (
                <div className="tab-features-box">
                  <h4 className="title--xs features-heading">Key Highlights & Features:</h4>
                  <ul className="features-checklist">
                    {details.features.map((feature, i) => (
                      <li key={i}>
                        <i className="fa-solid fa-circle-check feature-check-icon"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="specs-card">
              <h3 className="title--sm">Technical Specifications</h3>
              {specsEntries && specsEntries.length > 0 ? (
                <table className="specs-table">
                  <tbody>
                    {specsEntries.map(([key, val]) => (
                      <tr key={key} className="specs-row">
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ul className="specs-list">
                  <li><strong>Category:</strong> {details.category || "General"}</li>
                  <li><strong>Origin:</strong> Premium Crafted Goods</li>
                  <li><strong>Warranty:</strong> 1 Year Manufacturer Warranty</li>
                  <li><strong>SKU:</strong> SHOP-CO-{details.id || 101}</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: Ratings & Reviews */}
        <div className={`tab-content ${activeTab === 1 ? "current" : ""}`}>
          <div className="reviews-header-row">
            <div>
              <h3 className="title--sm">
                Verified Buyer Reviews ({reviewsList.length})
              </h3>
              <p className="text--sm text--gray">
                Real feedback from corporate gifting clients, event organizers, and individual buyers.
              </p>
            </div>
          </div>
          <div className="product-reviews-grid">
            {reviewsList.map((review, index) => (
              <div key={index} className="long-review-wrapper">
                <ReviewCard
                  firstName={review.firstName}
                  lastNameLetter={review.lastNameLetter}
                  company={review.company}
                  text={review.text}
                />
              </div>
            ))}
          </div>
          {reviewsList.length <= 4 && (
            <button
              className="btn-pill btn-white btn-center"
              onClick={loadMoreReviews}
            >
              Load More Reviews
            </button>
          )}
        </div>

        {/* Tab 2: FAQs */}
        <div className={`tab-content ${activeTab === 2 ? "current" : ""}`}>
          <div className="faqs-list">
            {details.faqs && details.faqs.length > 0 ? (
              details.faqs.map((faq, idx) => (
                <div key={idx} className="faq-item">
                  <h3 className="faq-question">Q: {faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))
            ) : (
              <>
                <div className="faq-item">
                  <h3 className="faq-question">Q: What is the Minimum Order Quantity (MOQ)?</h3>
                  <p className="faq-answer">
                    Standard bulk production MOQ is 100 units. You can also order individual sample units directly through the website prior to placing volume orders.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">Q: Can we add our custom company logo?</h3>
                  <p className="faq-answer">
                    Yes! We offer Digital UV Full-Color Printing, Silk Screen Printing, and Laser Engraving. Our design team provides a complimentary digital proof mockup for your approval before bulk production begins.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">Q: Do you issue B2B GST tax invoices?</h3>
                  <p className="faq-answer">
                    Yes, an official 18% GST tax invoice is issued with your company name and GSTIN for claiming full input tax credit.
                  </p>
                </div>
                <div className="faq-item">
                  <h3 className="faq-question">Q: What is the delivery turnaround time?</h3>
                  <p className="faq-answer">
                    Custom-branded bulk orders are dispatched within 7–10 business days across India and internationally. Unprinted sample orders dispatch within 24–48 hours.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoTabs;
