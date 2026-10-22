import { Link } from "react-router-dom";

const POLICIES = [
  {
    id: "shipping-policy",
    icon: "fa-solid fa-box-open",
    title: "Complimentary Delivery",
    detail: "Orders above ₹1,999 receive free domestic priority dispatch within 24–48 hours.",
    actionText: "Shipping Policy",
    link: "/underconstruction",
    badge: "Active Service",
  },
  {
    id: "return-policy",
    icon: "fa-solid fa-rotate-left",
    title: "30-Day Return Privilege",
    detail: "Try garments in the comfort of your home with straightforward exchanges.",
    actionText: "Return Policy",
    link: "/underconstruction",
    badge: "Guaranteed",
  },
  {
    id: "support-policy",
    icon: "fa-solid fa-headset",
    title: "Dedicated Concierge",
    detail: "Direct assistance for sizing, styling, and order tracking Mon–Sat, 9 AM – 7 PM IST.",
    actionText: "Contact Care",
    link: "/underconstruction",
    badge: "Live Support",
  },
  {
    id: "security-policy",
    icon: "fa-solid fa-lock",
    title: "Encrypted Transactions",
    detail: "256-bit SSL encryption, PCI-compliant card processing, and official GST tax invoices.",
    actionText: "Payment Security",
    link: "/underconstruction",
    badge: "Verified SSL",
  },
];

const ShoppingReassurance = () => {
  return (
    <section className="shopping-reassurance-section" aria-label="Shopping Reassurance & Policies">
      <div className="container">
        <div className="reassurance-header">
          <span className="section-kicker">Reassurance & Peace of Mind</span>
          <h2 className="reassurance-title title">A Considered Shopping Experience</h2>
          <p className="reassurance-subtitle">
            Every step—from intentional selection to doorstep delivery—is handled with utmost care.
          </p>
        </div>

        <div className="reassurance-grid">
          {POLICIES.map((p) => (
            <div key={p.id} className="reassurance-card">
              <div className="reassurance-card-top">
                <div className="reassurance-icon">
                  <i className={p.icon}></i>
                </div>
                <span className="reassurance-badge">{p.badge}</span>
              </div>

              <h3 className="reassurance-card-title">{p.title}</h3>
              <p className="reassurance-card-detail">{p.detail}</p>

              <Link to={p.link} className="reassurance-card-link">
                {p.actionText} <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShoppingReassurance;
