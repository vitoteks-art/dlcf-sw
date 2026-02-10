import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import RichTextEditor from "../RichTextEditor";

const defaultForm = {
  title: "",
  description: "",
  content_html: "",
  publication_type: "",
  file_url: "",
  cover_image_url: "",
  publish_date: "",
  tags: "",
  scope: "zonal",
  state: "",
  status: "draft",
};

export default function AdminPublications({
  states = [],
  setStatus,
  canManagePublications,
  uploadImage,
}) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });

  const isEditing = useMemo(() => editId !== "", [editId]);

  const loadItems = async () => {
    try {
      const params = new URLSearchParams(filters);
      const data = await apiFetch(`/admin/publication-items?${params.toString()}`);
      setItems(data.items || []);
    } catch (err) {
      setItems([]);
      if (setStatus) setStatus(err.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters.state, filters.status]);

  const resetForm = () => {
    setEditId("");
    setForm({ ...defaultForm });
  };

  const handleFileUpload = async (file, field) => {
    if (!file || !uploadImage) return;
    if (setStatus) setStatus("");
    try {
      const url = await uploadImage(file);
      if (url) {
        setForm((prev) => ({ ...prev, [field]: url }));
      }
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (setStatus) setStatus("");
    try {
      if (isEditing) {
        await apiFetch(`/admin/publication-items/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/admin/publication-items", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      resetForm();
      loadItems();
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this publication?")) return;
    if (setStatus) setStatus("");
    try {
      await apiFetch(`/admin/publication-items/${id}`, { method: "DELETE" });
      loadItems();
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Publications Library</h3>
      </div>

      <div className="panel-content">
        {canManagePublications ? (
          <div className="form-card card">
            <h4>{isEditing ? "Edit Publication" : "Add Publication"}</h4>
            <form onSubmit={handleSubmit} className="form compact-form">
              <div className="grid-2">
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
                  Publication Type
                  <input
                    type="text"
                    value={form.publication_type}
                    onChange={(e) => setForm({ ...form, publication_type: e.target.value })}
                    placeholder="Manual, Outline, Magazine..."
                    required
                  />
                </label>
              </div>
              <label>
                Description
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <div className="rich-field">
                <label>Publication Content</label>
                <RichTextEditor
                  value={form.content_html}
                  onChange={(value) => setForm({ ...form, content_html: value })}
                  onUploadImage={uploadImage}
                />
              </div>
              <div className="grid-2">
                <label>
                  File URL (Optional)
                  <input
                    type="text"
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  />
                </label>
                <label>
                  Cover Image URL
                  <input
                    type="text"
                    value={form.cover_image_url}
                    onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Upload Publication (PDF)
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], "file_url")}
                  />
                </label>
                <label>
                  Upload Cover Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], "cover_image_url")}
                  />
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Publish Date
                  <input
                    type="date"
                    value={form.publish_date}
                    onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
                  />
                </label>
                <label>
                  Tags (comma-separated)
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Scope
                  <select
                    value={form.scope}
                    onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  >
                    <option value="zonal">Zonal</option>
                    <option value="state">State</option>
                  </select>
                </label>
                <label>
                  State
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    disabled={form.scope !== "state"}
                  >
                    <option value="">Select state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
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
        ) : (
          <div className="card">
            <p className="lede">You have read-only access to publications.</p>
          </div>
        )}

        <div className="table-container card">
          <div className="section-header">
            <h4>Publication Items</h4>
            <div className="form-actions">
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              >
                <option value="">All states</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={String(item.id) === editId ? "active-row" : ""}>
                  <td>{item.title}</td>
                  <td>{item.publication_type}</td>
                  <td>{item.scope === "state" ? item.state || "State" : "Zonal"}</td>
                  <td>{item.status}</td>
                  <td>{item.publish_date || "-"}</td>
                  <td className="actions-cell">
                    {canManagePublications ? (
                      <>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => {
                            setEditId(String(item.id));
                            setForm({
                              title: item.title || "",
                              description: item.description || "",
                              content_html: item.content_html || "",
                              publication_type: item.publication_type || "",
                              file_url: item.file_url || "",
                              cover_image_url: item.cover_image_url || "",
                              publish_date: item.publish_date || "",
                              tags: item.tags || "",
                              scope: item.scope || "zonal",
                              state: item.state || "",
                              status: item.status || "draft",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6">No publication items yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
