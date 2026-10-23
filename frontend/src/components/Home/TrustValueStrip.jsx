const BENEFITS = [
  {
    id: "branding",
    icon: "fa-solid fa-wand-magic-sparkles",
    title: "Custom Logo Branding",
    description: "Precision Digital UV printing, laser engraving, and screen print on every item.",
  },
  {
    id: "gst-billing",
    icon: "fa-solid fa-receipt",
    title: "Official B2B GST 18% Invoices",
    description: "100% compliant business invoices provided for input tax credit on all bulk dispatches.",
  },
  {
    id: "pan-india",
    icon: "fa-solid fa-truck-fast",
    title: "Pan-India Multi-City Delivery",
    description: "Doorstep delivery to remote employee residences or consolidated branch shipments.",
  },
  {
    id: "volume-pricing",
    icon: "fa-solid fa-boxes-stacked",
    title: "Tiered Volume Pricing",
    description: "Institutional discounts, free digital sample proofs, and dedicated account manager.",
  },
];

const TrustValueStrip = () => {
  return (
    <section className="trust-strip-section" aria-label="Gifting Value Pillars">
      <div className="container">
        <div className="trust-strip-grid">
          {BENEFITS.map((b, idx) => (
            <div key={b.id} className="trust-strip-item">
              <div className="trust-strip-icon-wrapper">
                <i className={b.icon}></i>
              </div>
              <div className="trust-strip-text">
                <h3 className="trust-strip-title">{b.title}</h3>
                <p className="trust-strip-desc">{b.description}</p>
              </div>
              {idx < BENEFITS.length - 1 && <span className="trust-strip-divider" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustValueStrip;
