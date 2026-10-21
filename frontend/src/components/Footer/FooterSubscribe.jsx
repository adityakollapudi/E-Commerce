const FooterSubscribe = () => {
  return (
    <div className="container subscribe-container">
      <h4 className="title subscribe-heading">
        Stay upto date about our latest offers
      </h4>
      <form className="subscribe-form" aria-label="Subscribe to newsletter">
        <label hidden htmlFor="form-subscribe">Enter your email:</label>
        <input
          type="email"
          id="form-subscribe"
          name="Newsletter subscribe email"
          className="subscribe-input btn-pill subscribe-input-email"
          placeholder="Enter your email address..."
          aria-label="Enter your email address"
        />

        <button className="btn-pill subscribe-input">
          Subscribe to newsletter
        </button>
      </form>
    </div>
  );
};

export default FooterSubscribe;
