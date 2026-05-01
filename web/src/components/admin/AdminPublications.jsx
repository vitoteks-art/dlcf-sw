import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import RichTextEditor from "../RichTextEditor";

const statuses = ["draft", "submitted", "changes_requested", "approved", "scheduled", "published", "archived", "rejected"];
const statusLabels = { draft: "Draft", submitted: "Submitted", changes_requested: "Changes Requested", approved: "Approved", scheduled: "Scheduled", published: "Published", archived: "Archived", rejected: "Rejected" };
const defaultForm = { title: "", slug: "", description: "", content_html: "", publication_type: "", author: "", file_url: "", cover_image_url: "", publish_date: "", tags: "", scope: "zonal", state: "", visibility: "public", seo_title: "", seo_description: "", workflow_note: "", is_featured: false, pinned_until: "", scheduled_at: "", status: "draft" };
const isStateScoped = (user) => user && ["state_cord", "state_admin"].includes(user.role);
const canUseZonalScope = (user) => user && ["administrator", "zonal_cord", "zonal_admin"].includes(user.role);

function StatusBadge({ value }) { return <span className={`status-badge status-${value}`}>{statusLabels[value] || value}</span>; }
function checklist(form) {
  return [
    ["Title", !!form.title.trim()],
    ["Description/excerpt", !!form.description.trim()],
    ["Publication type/category", !!form.publication_type.trim()],
    ["Cover image", !!form.cover_image_url.trim()],
    ["Content body or PDF/file", !!form.content_html.trim() || !!form.file_url.trim()],
    ["Scope/state", form.scope === "zonal" || !!form.state],
    ["SEO title", !!form.seo_title.trim()],
    ["SEO description", !!form.seo_description.trim()],
  ];
}

export default function AdminPublications({ user, states = [], setStatus, canManagePublications, canPublishMedia, uploadImage }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "", q: "", publication_type: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });
  const stateScoped = isStateScoped(user);
  const visibleStates = stateScoped ? (user?.state ? [user.state] : []) : states;
  const canPublish = !!canPublishMedia;
  const isEditing = editId !== "";
  const counts = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status]: items.filter((item) => item.status === status).length }), {}), [items]);
  const publishReady = checklist(form).every(([, ok]) => ok);

  const effectiveForm = () => ({ ...form, scope: stateScoped ? "state" : form.scope, state: stateScoped ? user.state : form.state, is_featured: !!form.is_featured });
  const loadItems = async () => {
    try { const params = new URLSearchParams(filters); const data = await apiFetch(`/admin/publication-items?${params.toString()}`); setItems(data.items || []); }
    catch (err) { setItems([]); setStatus?.(err.message); }
  };
  useEffect(() => { loadItems(); }, [filters.state, filters.status, filters.publication_type]);

  const resetForm = () => { setEditId(""); setForm({ ...defaultForm, scope: stateScoped ? "state" : "zonal", state: stateScoped ? user.state || "" : "" }); };
  const handleFileUpload = async (file, field) => {
    if (!file || !uploadImage) return;
    setStatus?.("");
    try { const url = await uploadImage(file); if (url) setForm((prev) => ({ ...prev, [field]: url })); }
    catch (err) { setStatus?.(err.message); }
  };
  const saveWithStatus = async (nextStatus) => {
    setStatus?.("");
    try {
      const payload = { ...effectiveForm(), status: nextStatus || form.status };
      if (isEditing) await apiFetch(`/admin/publication-items/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await apiFetch("/admin/publication-items", { method: "POST", body: JSON.stringify(payload) });
      resetForm(); await loadItems(); setStatus?.("Publication saved.");
    } catch (err) { setStatus?.(err.message); }
  };
  const handleSubmit = (event) => { event.preventDefault(); saveWithStatus(form.status); };
  const archiveItem = async (item) => {
    if (!window.confirm(`Archive publication: ${item.title}?`)) return;
    setStatus?.("");
    try { await apiFetch(`/admin/publication-items/${item.id}`, { method: "DELETE" }); await loadItems(); setStatus?.("Publication archived."); }
    catch (err) { setStatus?.(err.message); }
  };
  const beginEdit = (item) => {
    setEditId(String(item.id));
    setForm({ ...defaultForm, ...item, publish_date: item.publish_date || "", pinned_until: item.pinned_until || "", scheduled_at: item.scheduled_at || "", is_featured: !!Number(item.is_featured || 0) });
  };

  return (
    <div className="admin-section">
      <div className="section-header"><div><h3>Publications Library</h3><p className="lede">Manage articles, PDFs, outlines, manuals, and study resources through review and publishing.</p></div><button type="button" className="btn-sm btn-outline" onClick={loadItems}>Refresh</button></div>
      <div className="stats-grid">{statuses.map((status) => <button key={status} type="button" className={`stat-card ${filters.status === status ? "active" : ""}`} onClick={() => setFilters({ ...filters, status })}><span>{statusLabels[status]}</span><strong>{counts[status] || 0}</strong></button>)}</div>
      <div className="admin-tabs-nav compact-tabs"><button className={!filters.status ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setFilters({ ...filters, status: "" })}>All</button>{statuses.map((status) => <button key={status} className={filters.status === status ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setFilters({ ...filters, status })}>{statusLabels[status]}</button>)}</div>
      <div className="panel-content">
        {canManagePublications ? <div className="form-card card"><h4>{isEditing ? "Edit Publication" : "Add Publication"}</h4><form onSubmit={handleSubmit} className="form compact-form">
          <div className="grid-2"><label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label>Slug<input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if blank" /></label></div>
          <div className="grid-2"><label>Publication Type<input value={form.publication_type} onChange={(e) => setForm({ ...form, publication_type: e.target.value })} placeholder="Manual, Outline, Magazine..." required /></label><label>Author<input value={form.author || ""} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label></div>
          <label>Description / Excerpt<textarea rows="3" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="rich-field"><label>Publication Content</label><RichTextEditor value={form.content_html || ""} onChange={(value) => setForm({ ...form, content_html: value })} onUploadImage={uploadImage} /></div>
          <div className="grid-2"><label>File URL / PDF<input value={form.file_url || ""} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></label><label>Cover Image URL<input value={form.cover_image_url || ""} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></label></div>
          <div className="grid-2"><label>Upload Publication (PDF)<input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e.target.files?.[0], "file_url")} /></label><label>Upload Cover Image<input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0], "cover_image_url")} /></label></div>
          <div className="grid-2"><label>Publish Date<input type="date" value={form.publish_date || ""} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></label><label>Tags<input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label></div>
          <div className="grid-2"><label>Scope<select value={stateScoped ? "state" : form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value, state: e.target.value === "zonal" ? "" : form.state })} disabled={!canUseZonalScope(user)}><option value="zonal">Zonal</option><option value="state">State</option></select></label><label>State<select value={stateScoped ? user.state || "" : form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={stateScoped || form.scope !== "state"}><option value="">Select state</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></label></div>
          <div className="grid-2"><label>Visibility<select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}><option value="public">Public</option><option value="members">Members</option><option value="leaders">Leaders</option><option value="private">Private</option></select></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((status) => <option key={status} value={status} disabled={["approved", "scheduled", "published", "archived", "rejected"].includes(status) && !canPublish}>{statusLabels[status]}</option>)}</select></label></div>
          <div className="grid-2"><label>SEO Title<input value={form.seo_title || ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></label><label>SEO Description<input value={form.seo_description || ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></label></div>
          <div className="grid-2"><label>Schedule At<input type="datetime-local" value={form.scheduled_at || ""} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></label><label>Pinned Until<input type="datetime-local" value={form.pinned_until || ""} onChange={(e) => setForm({ ...form, pinned_until: e.target.value })} /></label></div>
          <label><input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} disabled={!canUseZonalScope(user)} /> Featured</label>
          <label>Review / Change Notes<textarea rows="2" value={form.workflow_note || ""} onChange={(e) => setForm({ ...form, workflow_note: e.target.value })} /></label>
          <div className="card soft-card"><strong>Publish checklist</strong>{checklist(form).map(([label, ok]) => <p key={label} className={ok ? "text-success" : "text-danger"}>{ok ? "✓" : "•"} {label}</p>)}</div>
          <div className="form-actions"><button type="submit">Save Draft/Status</button><button type="button" onClick={() => saveWithStatus("submitted")}>Submit for Review</button>{canPublish ? <><button type="button" onClick={() => saveWithStatus("approved")} disabled={!publishReady}>Mark Approved</button><button type="button" onClick={() => saveWithStatus("published")} disabled={!publishReady}>Publish Now</button><button type="button" onClick={() => saveWithStatus("scheduled")} disabled={!publishReady}>Schedule</button></> : null}{isEditing ? <button type="button" onClick={resetForm}>Cancel</button> : null}</div>
        </form></div> : <div className="card"><p className="lede">You have read-only access to publications.</p></div>}
        <div className="table-container card"><div className="section-header"><h4>Publication Items</h4><div className="form-actions"><input placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} onBlur={loadItems} /><select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} disabled={stateScoped}><option value="">All states</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select><input placeholder="Type" value={filters.publication_type} onChange={(e) => setFilters({ ...filters, publication_type: e.target.value })} onBlur={loadItems} /></div></div><table className="data-table"><thead><tr><th>Title</th><th>Type</th><th>Scope</th><th>Status</th><th>Visibility</th><th>Date</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className={String(item.id) === editId ? "active-row" : ""}><td>{item.title}</td><td>{item.publication_type}</td><td>{item.scope === "state" ? item.state || "State" : "Zonal"}</td><td><StatusBadge value={item.status} /></td><td>{item.visibility || "public"}</td><td>{item.publish_date || "-"}</td><td className="actions-cell">{canManagePublications ? <><button className="btn-sm btn-outline" onClick={() => beginEdit(item)}>Edit</button>{canPublish ? <button className="btn-sm btn-danger" onClick={() => archiveItem(item)}>{item.status === "archived" ? "Archived" : "Archive"}</button> : null}</> : <span>-</span>}</td></tr>)}{items.length === 0 ? <tr><td colSpan="7">No publications match this view.</td></tr> : null}</tbody></table></div>
      </div>
    </div>
  );
}
