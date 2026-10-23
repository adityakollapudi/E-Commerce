import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setStatus("error");
      setErrorMessage("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    // Duplicate subscription check via localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("atelier_newsletter_subscribers") || "[]");
      if (stored.includes(trimmed)) {
        setStatus("error");
        setErrorMessage("This email is already subscribed to our journal.");
        return;
      }
    } catch {
      // Ignore storage errors
    }

    setStatus("loading");
    setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("atelier_newsletter_subscribers") || "[]");
        stored.push(trimmed);
        localStorage.setItem("atelier_newsletter_subscribers", JSON.stringify(stored));
      } catch {
        // Fallback
      }
      setStatus("success");
    }, 600);
  };

  return (
    <section className="newsletter-editorial-section" aria-label="Newsletter Subscription">
      <div className="container">
        <div className="newsletter-editorial-card">
          <span className="newsletter-kicker">Corporate Lookbook 2026</span>
          <h2 className="newsletter-headline title">Get Master Catalogues & Volume Slabs.</h2>
          <p className="newsletter-subtext">
            Subscribe to receive our latest 92-page PDF corporate gifting catalog, volume discount structures, and festive early-bird booking alerts.
          </p>

          {status === "success" ? (
            <div className="newsletter-success-state" role="status">
              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 className="success-title">Catalogue Access Confirmed!</h3>
              <p className="success-desc">
                Thank you! We have dispatched our 2026 Corporate Gifting Lookbook link to <strong>{email}</strong>. Use code{" "}
                <span className="promo-code-pill">GIFT20</span> for volume discounts on your first corporate dispatch.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                }}
                className="btn-luxury btn-outline"
                style={{ marginTop: "16px" }}
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form-editorial" noValidate>
              <div className="newsletter-input-group">
                <div className="newsletter-input-wrapper">
                  <i className="fa-regular fa-envelope input-icon" aria-hidden="true"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Enter your email address"
                    className={`newsletter-input ${status === "error" ? "input-error" : ""}`}
                    aria-label="Email address for newsletter"
                    aria-invalid={status === "error"}
                    aria-describedby={status === "error" ? "newsletter-error" : undefined}
                    disabled={status === "loading"}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-luxury btn-primary newsletter-submit-btn"
                >
                  {status === "loading" ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Subscribing...
                    </>
                  ) : (
                    <>Subscribe →</>
                  )}
                </button>
              </div>

              {status === "error" && (
                <p id="newsletter-error" className="newsletter-error-text" role="alert">
                  <i className="fa-solid fa-circle-exclamation"></i> {errorMessage}
                </p>
              )}

              <p className="newsletter-privacy-note">
                Local demonstration state. Unsubscribe at any time with no spam guaranteed.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
