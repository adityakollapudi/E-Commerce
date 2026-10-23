import { useState } from "react";
import { CATALOGUES_LIST, CONTACT_INFO } from "../../data/navigationData";

const CatalogueDownloadModal = ({ isOpen, onClose }) => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadedList, setDownloadedList] = useState({});

  if (!isOpen) return null;

  const handleDownload = (catalog) => {
    setDownloadingId(catalog.id);

    // Simulate instant secure PDF brochure download
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadedList((prev) => ({ ...prev, [catalog.id]: true }));

      // Create a programmatic download link of a text/pdf representation
      const element = document.createElement("a");
      const file = new Blob(
        [
          `ATELIER CORPORATE & FESTIVE GIFTING CATALOGUE 2026\n=======================================================\nTitle: ${catalog.title}\nSubtitle: ${catalog.subtitle}\nVerified B2B Institutional Collection\n\nTo place orders or request samples, contact:\nPhone: ${CONTACT_INFO.phonePrimary}\nEmail: ${CONTACT_INFO.emailBulk}\nPan-India Delivery with GST Billing.\nWebsite: http://localhost:5173/`,
        ],
        { type: "text/plain" }
      );
      element.href = URL.createObjectURL(file);
      element.download = `${catalog.id}-brochure-2026.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 800);
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div
        className="catalogue-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="catalogue-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="catalogue-modal-header">
          <div className="catalogue-kicker">
            <i className="fa-solid fa-file-arrow-down"></i> Official Publications 2026
          </div>
          <h2 id="catalogue-modal-title">Download Product Catalogues</h2>
          <p>
            Browse high-resolution lookbooks featuring complete specifications, color options, MOQ slabs, and custom logo branding guidelines.
          </p>
        </div>

        <div className="catalogues-modal-list">
          {CATALOGUES_LIST.map((catalog) => {
            const isDownloading = downloadingId === catalog.id;
            const hasDownloaded = downloadedList[catalog.id];

            return (
              <div key={catalog.id} className="catalogue-item-card">
                <div
                  className="catalogue-file-icon"
                  style={{ backgroundColor: `${catalog.color}15`, color: catalog.color }}
                >
                  <i className={catalog.icon}></i>
                </div>

                <div className="catalogue-file-info">
                  <h4 className="catalogue-item-title">{catalog.title}</h4>
                  <p className="catalogue-item-sub">{catalog.subtitle}</p>
                  <div className="catalogue-meta-badges">
                    <span className="cat-badge-size">{catalog.size}</span>
                    <span className="cat-badge-pages">{catalog.pages}</span>
                    <span className="cat-badge-verified">
                      <i className="fa-solid fa-check"></i> 2026 Updated Edition
                    </span>
                  </div>
                </div>

                <div className="catalogue-file-action">
                  <button
                    type="button"
                    onClick={() => handleDownload(catalog)}
                    disabled={isDownloading}
                    className={`btn-catalogue-download ${hasDownloaded ? "downloaded" : ""}`}
                  >
                    {isDownloading ? (
                      <span>
                        <i className="fa-solid fa-spinner fa-spin"></i> Preparing...
                      </span>
                    ) : hasDownloaded ? (
                      <span>
                        <i className="fa-solid fa-check"></i> Downloaded
                      </span>
                    ) : (
                      <span>
                        <i className="fa-solid fa-arrow-down"></i> Download PDF
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="catalogue-modal-footer">
          <div className="catalogue-whatsapp-box">
            <i className="fa-brands fa-whatsapp whatsapp-icon"></i>
            <div>
              <strong>Prefer Catalogues on WhatsApp?</strong>
              <p>Get instant PDF brochures sent directly to your phone number.</p>
            </div>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, "")}?text=Please%20send%20me%20the%20complete%20Corporate%20Gifting%20Catalogues%20PDF`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp-cat-link"
            >
              Get on WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogueDownloadModal;
