import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

const statuses = ["draft", "submitted", "changes_requested", "approved", "scheduled", "published", "archived", "rejected"];
const statusLabels = {
  draft: "Draft",
  submitted: "Submitted",
  changes_requested: "Changes Requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
  rejected: "Rejected",
};
const mediaTypes = ["audio", "video", "image", "photo", "external"];
const defaultForm = {
  title: "",
  slug: "",
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
  visibility: "public",
  seo_title: "",
  seo_description: "",
  workflow_note: "",
  is_featured: false,
  pinned_until: "",
  scheduled_at: "",
  status: "draft",
};

const isStateScoped = (user) => user && ["state_cord", "state_admin"].includes(user.role);
const canUseZonalScope = (user) => user && ["administrator", "zonal_cord", "zonal_admin"].includes(user.role);

function StatusBadge({ value }) {
  return <span className={`status-badge status-${value}`}>{statusLabels[value] || value}</span>;
}

function checklist(form) {
  const items = [
    ["Title", !!form.title.trim()],
    ["Description/excerpt", !!form.description.trim()],
    ["Media type", !!form.media_type],
    ["Source URL/upload", !!form.source_url.trim()],
    ["Scope/state", form.scope === "zonal" || !!form.state],
    ["SEO title", !!form.seo_title.trim()],
    ["SEO description", !!form.seo_description.trim()],
  ];
  if (["video", "external"].includes(form.media_type)) {
    items.push(["Thumbnail", !!form.thumbnail_url.trim()]);
  }
  return items;
}

export default function AdminMedia({ user, states = [], setStatus, canManageMedia, canPublishMedia, uploadImage }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "", q: "", media_type: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });

  const stateScoped = isStateScoped(user);
  const visibleStates = stateScoped ? (user?.state ? [user.state] : []) : states;
  const canPublish = !!canPublishMedia;
  const isEditing = editId !== "";
  const counts = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status]: items.filter((item) => item.status === status).length }), {}), [items]);
  const publishReady = checklist(form).every(([, ok]) => ok);

  const effectiveForm = () => ({
    ...form,
    scope: stateScoped ? "state" : form.scope,
    state: stateScoped ? user.state : form.state,
    is_featured: !!form.is_featured,
  });

  const loadItems = async () => {
    try {
      const params = new URLSearchParams(filters);
      const data = await apiFetch(`/admin/media-items?${params.toString()}`);
      setItems(data.items || []);
    } catch (err) {
      setItems([]);
      setStatus?.(err.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters.state, filters.status, filters.media_type]);

  const resetForm = () => {
    setEditId("");
    setForm({ ...defaultForm, scope: stateScoped ? "state" : "zonal", state: stateScoped ? user.state || "" : "" });
  };

  const handleFileUpload = async (file, field) => {
    if (!file || !uploadImage) return;
    setStatus?.("");
    try {
      const url = await uploadImage(file);
      if (url) setForm((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      setStatus?.(err.message);
    }
  };

  const saveWithStatus = async (nextStatus) => {
    setStatus?.("");
    try {
      const payload = { ...effectiveForm(), status: nextStatus || form.status };
      if (isEditing) {
        await apiFetch(`/admin/media-items/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/admin/media-items", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      await loadItems();
      setStatus?.("Media item saved.");
    } catch (err) {
      setStatus?.(err.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveWithStatus(form.status);
  };

  const archiveItem = async (item) => {
    if (!window.confirm(`Archive media item: ${item.title}?`)) return;
    setStatus?.("");
    try {
      await apiFetch(`/admin/media-items/${item.id}`, { method: "DELETE" });
      await loadItems();
      setStatus?.("Media item archived.");
    } catch (err) {
      setStatus?.(err.message);
    }
  };

  const beginEdit = (item) => {
    setEditId(String(item.id));
    setForm({
      ...defaultForm,
      ...item,
      duration_seconds: item.duration_seconds || "",
      event_date: item.event_date || "",
      pinned_until: item.pinned_until || "",
      scheduled_at: item.scheduled_at || "",
      is_featured: !!Number(item.is_featured || 0),
    });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h3>Media Library</h3>
          <p className="lede">Manage audio, video, images, and external media through draft, review, approval, publishing, and archive.</p>
        </div>
        <button type="button" className="btn-sm btn-outline" onClick={loadItems}>Refresh</button>
      </div>

      <div className="stats-grid">
        {statuses.map((status) => (
          <button key={status} type="button" className={`stat-card ${filters.status === status ? "active" : ""}`} onClick={() => setFilters({ ...filters, status })}>
            <span>{statusLabels[status]}</span>
            <strong>{counts[status] || 0}</strong>
          </button>
        ))}
      </div>

      <div className="admin-tabs-nav compact-tabs">
        <button className={!filters.status ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setFilters({ ...filters, status: "" })}>All</button>
        {statuses.map((status) => <button key={status} className={filters.status === status ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setFilters({ ...filters, status })}>{statusLabels[status]}</button>)}
      </div>

      <div className="panel-content">
        {canManageMedia ? (
          <div className="form-card card">
            <h4>{isEditing ? "Edit Media" : "Add Media"}</h4>
            <form onSubmit={handleSubmit} className="form compact-form">
              <div className="grid-2"><label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label>Slug<input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if blank" /></label></div>
              <div className="grid-2"><label>Media Type<select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })}>{mediaTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label>Visibility<select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}><option value="public">Public</option><option value="members">Members</option><option value="leaders">Leaders</option><option value="private">Private</option></select></label></div>
              <div className="grid-2"><label>Speaker<input value={form.speaker || ""} onChange={(e) => setForm({ ...form, speaker: e.target.value })} /></label><label>Series<input value={form.series || ""} onChange={(e) => setForm({ ...form, series: e.target.value })} /></label></div>
              <label>Description / Excerpt<textarea rows="3" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <div className="grid-2"><label>Source URL<input value={form.source_url || ""} onChange={(e) => setForm({ ...form, source_url: e.target.value })} required /></label><label>Thumbnail URL<input value={form.thumbnail_url || ""} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></label></div>
              <div className="grid-2"><label>Upload Media File<input type="file" accept="audio/*,video/*,image/*,application/pdf" onChange={(e) => handleFileUpload(e.target.files?.[0], "source_url")} /></label><label>Upload Thumbnail<input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0], "thumbnail_url")} /></label></div>
              <div className="grid-2"><label>Duration (seconds)<input type="number" value={form.duration_seconds || ""} onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })} /></label><label>Event Date<input type="date" value={form.event_date || ""} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></label></div>
              <label>Tags<input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="comma-separated" /></label>
              <div className="grid-2"><label>Scope<select value={stateScoped ? "state" : form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value, state: e.target.value === "zonal" ? "" : form.state })} disabled={!canUseZonalScope(user)}><option value="zonal">Zonal</option><option value="state">State</option></select></label><label>State<select value={stateScoped ? user.state || "" : form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={stateScoped || form.scope !== "state"}><option value="">Select state</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></label></div>
              <div className="grid-2"><label>SEO Title<input value={form.seo_title || ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></label><label>SEO Description<input value={form.seo_description || ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></label></div>
              <div className="grid-2"><label>Schedule At<input type="datetime-local" value={form.scheduled_at || ""} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></label><label>Pinned Until<input type="datetime-local" value={form.pinned_until || ""} onChange={(e) => setForm({ ...form, pinned_until: e.target.value })} /></label></div>
              <label><input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} disabled={!canUseZonalScope(user)} /> Featured</label>
              <label>Review / Change Notes<textarea rows="2" value={form.workflow_note || ""} onChange={(e) => setForm({ ...form, workflow_note: e.target.value })} /></label>
              <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((status) => <option key={status} value={status} disabled={["approved", "scheduled", "published", "archived", "rejected"].includes(status) && !canPublish}>{statusLabels[status]}</option>)}</select></label>
              <div className="card soft-card"><strong>Publish checklist</strong>{checklist(form).map(([label, ok]) => <p key={label} className={ok ? "text-success" : "text-danger"}>{ok ? "✓" : "•"} {label}</p>)}</div>
              <div className="form-actions"><button type="submit">Save Draft/Status</button><button type="button" onClick={() => saveWithStatus("submitted")}>Submit for Review</button>{canPublish ? <><button type="button" onClick={() => saveWithStatus("approved")} disabled={!publishReady}>Mark Approved</button><button type="button" onClick={() => saveWithStatus("published")} disabled={!publishReady}>Publish Now</button><button type="button" onClick={() => saveWithStatus("scheduled")} disabled={!publishReady}>Schedule</button></> : null}{isEditing ? <button type="button" onClick={resetForm}>Cancel</button> : null}</div>
            </form>
          </div>
        ) : <div className="card"><p className="lede">You have read-only access to media items.</p></div>}

        <div className="table-container card">
          <div className="section-header"><h4>Media Items</h4><div className="form-actions"><input placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} onBlur={loadItems} /><select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} disabled={stateScoped}><option value="">All states</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select><select value={filters.media_type} onChange={(e) => setFilters({ ...filters, media_type: e.target.value })}><option value="">All media</option>{mediaTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div></div>
          <table className="data-table"><thead><tr><th>Title</th><th>Type</th><th>Scope</th><th>Status</th><th>Visibility</th><th>Date</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className={String(item.id) === editId ? "active-row" : ""}><td>{item.title}</td><td>{item.media_type}</td><td>{item.scope === "state" ? item.state || "State" : "Zonal"}</td><td><StatusBadge value={item.status} /></td><td>{item.visibility || "public"}</td><td>{item.event_date || "-"}</td><td className="actions-cell">{canManageMedia ? <><button className="btn-sm btn-outline" onClick={() => beginEdit(item)}>Edit</button>{canPublish ? <button className="btn-sm btn-danger" onClick={() => archiveItem(item)}>{item.status === "archived" ? "Archived" : "Archive"}</button> : null}</> : <span>-</span>}</td></tr>)}{items.length === 0 ? <tr><td colSpan="7">No media items match this view.</td></tr> : null}</tbody></table>
        </div>
      </div>
    </div>
  );
}
