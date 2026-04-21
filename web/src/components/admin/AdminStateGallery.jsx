import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

const CATEGORY_OPTIONS = ["Conference", "Outreach", "Worship", "Fellowship", "Campus", "Special"];

const defaultForm = {
  title: "",
  caption: "",
  image_url: "",
  category: "Conference",
  event_date: "",
  state: "",
  status: "draft",
  sort_order: "0",
};

export default function AdminStateGallery({
  user,
  states = [],
  setStatus,
  uploadImage,
}) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "", category: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });

  const isStateAdmin = user && ["state_cord", "state_admin"].includes(user.role);
  const isEditing = useMemo(() => editId !== "", [editId]);
  const stateOptions = useMemo(() => states.map((state) => (typeof state === "string" ? state : state?.name || "")).filter(Boolean), [states]);

  useEffect(() => {
    if (isStateAdmin && user?.state) {
      setForm((prev) => ({ ...prev, state: user.state }));
      setFilters((prev) => ({ ...prev, state: user.state }));
    }
  }, [isStateAdmin, user?.state]);

  const loadItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.state) params.set("state", filters.state);
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      const data = await apiFetch(`/admin/state-gallery-items?${params.toString()}`);
      setItems(data.items || []);
    } catch (err) {
      setItems([]);
      if (setStatus) setStatus(err.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters.state, filters.status, filters.category]);

  const resetForm = () => {
    setEditId("");
    setForm({ ...defaultForm, state: isStateAdmin && user?.state ? user.state : "" });
  };

  const handleFileUpload = async (file) => {
    if (!file || !uploadImage) return;
    if (setStatus) setStatus("");
    try {
      const url = await uploadImage(file);
      if (url) setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (setStatus) setStatus("");
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order || 0),
      };
      if (isEditing) {
        await apiFetch(`/admin/state-gallery-items/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin/state-gallery-items", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      loadItems();
      if (setStatus) setStatus(isEditing ? "Gallery item updated." : "Gallery item added.");
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;
    if (setStatus) setStatus("");
    try {
      await apiFetch(`/admin/state-gallery-items/${id}`, { method: "DELETE" });
      loadItems();
      if (setStatus) setStatus("Gallery item deleted.");
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  const startEdit = (item) => {
    setEditId(String(item.id));
    setForm({
      title: item.title || "",
      caption: item.caption || "",
      image_url: item.image_url || "",
      category: item.category || "Conference",
      event_date: item.event_date || "",
      state: item.state || (isStateAdmin ? user?.state || "" : ""),
      status: item.status || "draft",
      sort_order: String(item.sort_order ?? 0),
    });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>State Gallery</h3>
      </div>

      <div className="panel-content">
        <div className="form-card card">
          <h4>{isEditing ? "Edit Gallery Item" : "Add Gallery Item"}</h4>
          <form onSubmit={handleSubmit} className="form compact-form">
            <div className="grid-2">
              <label>
                State
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  disabled={isStateAdmin}
                >
                  <option value="">Select state</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label>
              Caption / Description
              <textarea
                rows="3"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </label>

            <div className="grid-2">
              <label>
                Image URL
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  required
                />
              </label>
              <label>
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="grid-2">
              <label>
                Event Date
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                />
              </label>
              <label>
                Sort Order
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </label>
            </div>

            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <div className="form-actions">
              <button type="submit">{isEditing ? "Update" : "Add"}</button>
              {isEditing ? (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="table-container card">
          <div className="section-header">
            <h4>Gallery Items</h4>
            <div className="form-actions">
              {!isStateAdmin ? (
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                >
                  <option value="">All states</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              ) : null}
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="lede">No gallery items yet. Add the first gallery photo above.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12 }}
                          />
                        ) : null}
                      </td>
                      <td>
                        <strong>{item.title}</strong>
                        {item.caption ? <div className="muted">{item.caption}</div> : null}
                      </td>
                      <td>{item.category}</td>
                      <td>{item.state}</td>
                      <td>{item.event_date || "-"}</td>
                      <td>{item.status}</td>
                      <td>
                        <div className="form-actions">
                          <button type="button" onClick={() => startEdit(item)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
