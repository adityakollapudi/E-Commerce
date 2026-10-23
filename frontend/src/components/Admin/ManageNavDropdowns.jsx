import { useState } from "react";
import { useSiteContent } from "../../context/SiteContentContext";

export const ManageServicesDropdown = ({ showToast }) => {
  const { services, updateServices } = useSiteContent();
  const [servicesList, setServicesList] = useState(() => (Array.isArray(services) ? services : []));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    icon: "fa-solid fa-briefcase",
    tag: "",
    link: "/products",
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      title: "",
      subtitle: "",
      description: "",
      icon: "fa-solid fa-handshake",
      tag: "Popular",
      link: "/products",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      icon: item.icon || "fa-solid fa-handshake",
      tag: item.tag || "",
      link: item.link || "/products",
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    if (!form.title.trim()) {
      showToast("Service title is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      let updated;
      if (editingItem) {
        updated = servicesList.map((s) => (s.id === editingItem.id ? { ...s, ...form } : s));
      } else {
        const newItem = {
          id: `service-${Date.now()}`,
          ...form,
        };
        updated = [...servicesList, newItem];
      }
      await updateServices(updated);
      setServicesList(updated);
      showToast(`Service "${form.title}" saved successfully!`);
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = servicesList.filter((s) => s.id !== itemToDelete.id);
      await updateServices(updated);
      setServicesList(updated);
      showToast(`Service "${itemToDelete.title}" removed.`);
      setItemToDelete(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nav-dropdown-admin-pane">
      <div className="tab-control-toolbar">
        <div>
          <h2><i className="fa-solid fa-handshake"></i> Services Dropdown Menu Options</h2>
          <p>These options appear inside the <strong>"Services"</strong> dropdown in the top navigation bar and on the homepage Services showcase.</p>
        </div>
        <button type="button" className="btn-add-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-plus"></i> Add Service Option
        </button>
      </div>

      <div className="services-admin-grid">
        {servicesList.map((service) => (
          <div key={service.id} className="service-admin-card">
            <div className="service-card-top">
              <div className="service-card-icon-box">
                <i className={service.icon || "fa-solid fa-briefcase"}></i>
              </div>
              <div className="service-card-info">
                <div className="service-card-title-row">
                  <strong>{service.title}</strong>
                  {service.tag && <span className="service-tag-pill">{service.tag}</span>}
                </div>
                <small className="service-subtitle-text">{service.subtitle}</small>
              </div>
            </div>

            <p className="service-desc-snippet">{service.description}</p>
            <div className="service-card-footer">
              <span className="service-link-subtext">Link: <code>{service.link}</code></span>
              <div className="service-actions-row">
                <button type="button" className="btn-brand-edit" onClick={() => handleOpenEdit(service)}>
                  <i className="fa-solid fa-pen"></i> Edit
                </button>
                <button type="button" className="btn-brand-delete" onClick={() => setItemToDelete(service)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingItem ? `Edit Service: ${editingItem.title}` : "Add New Service Option"}</h2>
              <button type="button" className="modal-close-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveModal} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Service Title <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Corporate Gifting, Return Gifting..."
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group half-col">
                  <label className="form-label">Subtitle / Sub-headline</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Custom Logo & Hampers"
                    className="form-input"
                  />
                </div>
                <div className="form-group half-col">
                  <label className="form-label">Badge Tag</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="High Volume, HR Fav"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half-col">
                  <label className="form-label">FontAwesome Icon Class</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="fa-solid fa-briefcase"
                    className="form-input"
                  />
                </div>
                <div className="form-group half-col">
                  <label className="form-label">Target Link / URL</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/products?search=Corporate"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of this gifting service..."
                  className="form-textarea"
                />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-save-modal">
                  {isSubmitting ? "Saving..." : editingItem ? "Save Service" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="admin-modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="admin-modal-dialog delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-circle"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h2>Delete "{itemToDelete.title}"?</h2>
            <p>This service option will be removed from the customer Services dropdown.</p>
            <div className="delete-modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setItemToDelete(null)}>Keep</button>
              <button type="button" disabled={isSubmitting} className="btn-confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ManageFestiveDropdown = ({ showToast }) => {
  const { festiveGifts, updateFestiveGifts } = useSiteContent();
  const [festiveList, setFestiveList] = useState(() => (Array.isArray(festiveGifts) ? festiveGifts : []));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    icon: "fa-solid fa-sparkles",
    badge: "Festive Star",
    itemsText: "",
    link: "/products?search=Diwali",
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      title: "",
      subtitle: "",
      description: "",
      icon: "fa-solid fa-gift",
      badge: "Festive",
      itemsText: "Gourmet Dry Fruits, Scented Candles, Brass Diyas",
      link: "/products?search=Festive",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      icon: item.icon || "fa-solid fa-sparkles",
      badge: item.badge || "",
      itemsText: Array.isArray(item.items) ? item.items.join(", ") : "",
      link: item.link || "/products",
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    const itemsArr = form.itemsText
      .split(",")
      .map((it) => it.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      let updated;
      if (editingItem) {
        updated = festiveList.map((f) =>
          f.id === editingItem.id
            ? { ...f, ...form, items: itemsArr }
            : f
        );
      } else {
        const newItem = {
          id: `festive-${Date.now()}`,
          ...form,
          items: itemsArr,
        };
        updated = [...festiveList, newItem];
      }
      await updateFestiveGifts(updated);
      setFestiveList(updated);
      showToast(`Festive option "${form.title}" saved successfully!`);
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = festiveList.filter((f) => f.id !== itemToDelete.id);
      await updateFestiveGifts(updated);
      setFestiveList(updated);
      showToast(`Festive option "${itemToDelete.title}" removed.`);
      setItemToDelete(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nav-dropdown-admin-pane">
      <div className="tab-control-toolbar">
        <div>
          <h2><i className="fa-solid fa-sparkles"></i> Festive Gifts Dropdown Menu Options</h2>
          <p>These collections appear inside the <strong>"Festive Gifts"</strong> dropdown in the top navigation bar.</p>
        </div>
        <button type="button" className="btn-add-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-plus"></i> Add Festive Collection
        </button>
      </div>

      <div className="services-admin-grid">
        {festiveList.map((festive) => (
          <div key={festive.id} className="service-admin-card festive-admin-card">
            <div className="service-card-top">
              <div className="service-card-icon-box festive-icon-box">
                <i className={festive.icon || "fa-solid fa-sparkles"}></i>
              </div>
              <div className="service-card-info">
                <div className="service-card-title-row">
                  <strong>{festive.title}</strong>
                  {festive.badge && <span className="cat-badge-highlight">{festive.badge}</span>}
                </div>
                <small className="service-subtitle-text">{festive.subtitle}</small>
              </div>
            </div>

            <p className="service-desc-snippet">{festive.description}</p>

            {Array.isArray(festive.items) && festive.items.length > 0 && (
              <div className="festive-items-chips-row">
                {festive.items.map((it, idx) => (
                  <span key={idx} className="festive-item-chip">{it}</span>
                ))}
              </div>
            )}

            <div className="service-card-footer">
              <span className="service-link-subtext">Link: <code>{festive.link}</code></span>
              <div className="service-actions-row">
                <button type="button" className="btn-brand-edit" onClick={() => handleOpenEdit(festive)}>
                  <i className="fa-solid fa-pen"></i> Edit
                </button>
                <button type="button" className="btn-brand-delete" onClick={() => setItemToDelete(festive)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingItem ? `Edit Festive Option: ${editingItem.title}` : "Add New Festive Option"}</h2>
              <button type="button" className="modal-close-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveModal} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Collection Title <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Diwali Gifting, New Year Kits..."
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group half-col">
                  <label className="form-label">Subtitle / Occasion</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Festival of Lights & Prosperity"
                    className="form-input"
                  />
                </div>
                <div className="form-group half-col">
                  <label className="form-label">Badge Tag</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Festive Star, Executive"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half-col">
                  <label className="form-label">FontAwesome Icon Class</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="fa-solid fa-sun, fa-solid fa-sparkles"
                    className="form-input"
                  />
                </div>
                <div className="form-group half-col">
                  <label className="form-label">Target Link / URL</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/products?search=Diwali"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sample Items Included (Comma-separated)</label>
                <input
                  type="text"
                  value={form.itemsText}
                  onChange={(e) => setForm({ ...form, itemsText: e.target.value })}
                  placeholder="Gourmet Dry Fruits, Silver Coins, Brass Diyas, Scented Candles"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of this festive collection..."
                  className="form-textarea"
                />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-save-modal">
                  {isSubmitting ? "Saving..." : editingItem ? "Save Festive Option" : "Add Festive Option"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="admin-modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="admin-modal-dialog delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-circle"><i className="fa-solid fa-triangle-exclamation"></i></div>
            <h2>Delete "{itemToDelete.title}"?</h2>
            <p>This festive option will be removed from the customer Festive Gifts dropdown.</p>
            <div className="delete-modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setItemToDelete(null)}>Keep</button>
              <button type="button" disabled={isSubmitting} className="btn-confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
