import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

const mediaTypes = ["audio", "video"];

export default function AdminMedia({
  states = [],
  setStatus,
  canManageMedia,
  uploadImage,
}) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    speaker: "",
    series: "",
    media_type: "audio",
    source_url: "",
    thumbnail_url: "",
    duration_seconds: "",
    event_date: "",
    tags: "",
    scope: "zonal",
    state: "",
    status: "draft",
  });

  const isEditing = useMemo(() => editId !== "", [editId]);

  const loadItems = async () => {
    try {
      const params = new URLSearchParams(filters);
      const data = await apiFetch(`/admin/media-items?${params.toString()}`);
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
    setForm({
      title: "",
      description: "",
      speaker: "",
      series: "",
      media_type: "audio",
      source_url: "",
      thumbnail_url: "",
      duration_seconds: "",
      event_date: "",
      tags: "",
      scope: "zonal",
      state: "",
      status: "draft",
    });
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
        await apiFetch(`/admin/media-items/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/admin/media-items", {
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
    if (!window.confirm("Delete this media item?")) return;
    if (setStatus) setStatus("");
    try {
      await apiFetch(`/admin/media-items/${id}`, { method: "DELETE" });
      loadItems();
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Media Library</h3>
      </div>

      <div className="panel-content">
        {canManageMedia ? (
          <div className="form-card card">
            <h4>{isEditing ? "Edit Media" : "Add Media"}</h4>
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
                Media Type
                <select
                  value={form.media_type}
                  onChange={(e) => setForm({ ...form, media_type: e.target.value })}
                >
                  {mediaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-2">
              <label>
                Speaker
                <input
                  type="text"
                  value={form.speaker}
                  onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                />
              </label>
              <label>
                Series
                <input
                  type="text"
                  value={form.series}
                  onChange={(e) => setForm({ ...form, series: e.target.value })}
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
            <div className="grid-2">
              <label>
                Source URL
                <input
                  type="text"
                  value={form.source_url}
                  onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                  required
                />
              </label>
              <label>
                Thumbnail URL
                <input
                  type="text"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Upload Media File
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "source_url")}
                />
              </label>
              <label>
                Upload Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "thumbnail_url")}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Duration (seconds)
                <input
                  type="number"
                  value={form.duration_seconds}
                  onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })}
                />
              </label>
              <label>
                Event Date
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                />
              </label>
            </div>
            <label>
              Tags (comma-separated)
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </label>
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
            <p className="lede">You have read-only access to media items.</p>
          </div>
        )}

        <div className="table-container card">
          <div className="section-header">
            <h4>Media Items</h4>
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
                  <td>{item.media_type}</td>
                  <td>{item.scope === "state" ? item.state || "State" : "Zonal"}</td>
                  <td>{item.status}</td>
                  <td>{item.event_date || "-"}</td>
                  <td className="actions-cell">
                    {canManageMedia ? (
                      <>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => {
                            setEditId(String(item.id));
                            setForm({
                              title: item.title || "",
                              description: item.description || "",
                              speaker: item.speaker || "",
                              series: item.series || "",
                              media_type: item.media_type || "audio",
                              source_url: item.source_url || "",
                              thumbnail_url: item.thumbnail_url || "",
                              duration_seconds: item.duration_seconds || "",
                              event_date: item.event_date || "",
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
                  <td colSpan="6">No media items yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
