import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmed = email.trim();
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

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
    }, 700);
  };

  return (
    <section className="newsletter-editorial-section" aria-label="Newsletter">
      <div className="container">
        <div className="newsletter-editorial-card">
          <span className="newsletter-kicker">The Atelier Dispatch</span>
          <h2 className="newsletter-headline title">A Little Something Worth Opening.</h2>
          <p className="newsletter-subtext">
            Subscribe to receive thoughtful reflections on design, early collection releases,
            and exclusive member invitations directly to your inbox.
          </p>

          {status === "success" ? (
            <div className="newsletter-success-state" role="status">
              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 className="success-title">Welcome to the Inner Circle.</h3>
              <p className="success-desc">
                We've sent a welcome invitation to <strong>{email}</strong>. Use code{" "}
                <span className="promo-code-pill">SHOP20</span> for 20% off your inaugural order.
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
                  <i className="fa-regular fa-envelope input-icon"></i>
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
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-luxury btn-primary newsletter-submit-btn"
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe →"}
                </button>
              </div>

              {status === "error" && (
                <p id="newsletter-error" className="newsletter-error-text" role="alert">
                  <i className="fa-solid fa-circle-exclamation"></i> {errorMessage}
                </p>
              )}

              <p className="newsletter-privacy-note">
                By subscribing, you agree to our Privacy Policy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
