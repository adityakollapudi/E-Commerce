import { useSiteContent } from "../../context/SiteContentContext";

const ContactUsDropdown = ({ isOpen, onClose, onOpenBulkModal }) => {
  const { contactInfo } = useSiteContent();
  return (
    <div
      className={`mega-menu-dropdown contact-dropdown ${isOpen ? "is-visible" : ""}`}
      role="region"
      aria-label="Contact Us Dropdown Menu"
    >
      <div className="contact-dropdown-inner">
        <div className="contact-dropdown-header">
          <span className="contact-badge">
            <i className="fa-solid fa-headset"></i> We're Here to Help
          </span>
          <h3>Contact Our Corporate Gifting Specialists</h3>
          <p>
            Connect directly with our dedicated gifting advisors for quotes, samples, custom branding queries, or urgent event deliveries.
          </p>
        </div>

        <div className="contact-info-grid">
          {/* Phone No */}
          <div className="contact-card-box">
            <div className="contact-box-icon phone-icon">
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <div className="contact-box-content">
              <span className="contact-box-title">Phone & WhatsApp</span>
              <a href={`tel:${(contactInfo.phonePrimary || "").replace(/\s+/g, "")}`} className="contact-primary-val">
                {contactInfo.phonePrimary}
              </a>
              <span className="contact-sub-val">Landline: {contactInfo.phoneSecondary}</span>
              <a
                href={`https://wa.me/${(contactInfo.whatsapp || "").replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20am%20interested%20in%20corporate%20gifting%20catalog`}
                target="_blank"
                rel="noreferrer"
                className="contact-whatsapp-btn"
              >
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Email ID */}
          <div className="contact-card-box">
            <div className="contact-box-icon email-icon">
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
            <div className="contact-box-content">
              <span className="contact-box-title">Email Enquiries</span>
              <a href={`mailto:${contactInfo.emailBulk}`} className="contact-primary-val">
                {contactInfo.emailBulk}
              </a>
              <span className="contact-sub-val">General: {contactInfo.emailGeneral}</span>
              <span className="contact-timing-note">
                <i className="fa-regular fa-clock"></i> Response within 2 working hours
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="contact-card-box">
            <div className="contact-box-icon address-icon">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div className="contact-box-content">
              <span className="contact-box-title">Headquarters & Experience Studio</span>
              <p className="contact-address-text">
                <strong>{contactInfo.addressLine1}</strong>
                <br />
                {contactInfo.addressLine2}
                <br />
                {contactInfo.city}
              </p>
              <span className="contact-shipping-note">
                <i className="fa-solid fa-truck"></i> Pan-India & Global Express Fulfillment
              </span>
            </div>
          </div>
        </div>

        <div className="contact-dropdown-bottom">
          <div className="contact-hours-strip">
            <i className="fa-regular fa-calendar-check"></i>
            <span>{contactInfo.workingHours}</span>
          </div>

          <div className="contact-bottom-actions">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenBulkModal) onOpenBulkModal("General Enquiry");
              }}
              className="btn-contact-quick-enquiry"
            >
              <i className="fa-solid fa-paper-plane"></i> Send Instant Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsDropdown;
