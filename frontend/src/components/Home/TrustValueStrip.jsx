const BENEFITS = [
  {
    id: "materials",
    icon: "fa-solid fa-shapes",
    title: "Considered Materials",
    description: "Pure combed cotton, tactile linen, and durable woven textiles.",
  },
  {
    id: "shipping",
    icon: "fa-solid fa-truck-fast",
    title: "Complimentary Delivery",
    description: "Free express shipping across India on orders above ₹1,999.",
  },
  {
    id: "returns",
    icon: "fa-solid fa-arrow-rotate-left",
    title: "30-Day Returns",
    description: "Simple, unhurried returns and exchanges on all eligible pieces.",
  },
  {
    id: "security",
    icon: "fa-solid fa-shield-halved",
    title: "Secure Checkout",
    description: "Bank-grade 256-bit SSL encryption and verified payment channels.",
  },
];

const TrustValueStrip = () => {
  return (
    <section className="trust-strip-section" aria-label="Brand Benefits">
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
