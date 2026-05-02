import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import RichTextEditor from "../RichTextEditor";

const statuses = ["draft", "submitted", "changes_requested", "approved", "scheduled", "published", "archived", "rejected"];
const statusLabels = { draft: "Draft", submitted: "Submitted", changes_requested: "Changes Requested", approved: "Approved", scheduled: "Scheduled", published: "Published", archived: "Archived", rejected: "Rejected" };
const uploadLimitText = "Upload limits: images up to 25MB, PDF/documents up to 50MB, audio up to 75MB, video up to 100MB.";
const defaultForm = { title: "", slug: "", description: "", content_html: "", publication_type: "", author: "", file_url: "", cover_image_url: "", cover_alt: "", cover_caption: "", publish_date: "", tags: "", scope: "zonal", state: "", visibility: "public", seo_title: "", seo_description: "", workflow_note: "", is_featured: false, pinned_until: "", scheduled_at: "", status: "draft" };
const isStateScoped = (user) => user && ["state_cord", "state_admin"].includes(user.role);
const canUseZonalScope = (user) => user && ["administrator", "zonal_cord", "zonal_admin"].includes(user.role);

function StatusBadge({ value }) { return <span className={`status-badge status-${value}`}>{statusLabels[value] || value}</span>; }
function checklist(form) {
  return [
    ["Title", !!form.title.trim()],
    ["Description/excerpt", !!form.description.trim()],
    ["Publication type/category", !!form.publication_type.trim()],
    ["Featured image", !!form.cover_image_url.trim()],
    ["Content body or PDF/file", !!form.content_html.trim() || !!form.file_url.trim()],
    ["Scope/state", form.scope === "zonal" || !!form.state],
    ["SEO title", !!form.seo_title.trim()],
    ["SEO description", !!form.seo_description.trim()],
  ];
}
function htmlToText(html = "") { return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function mediaTypeFromUrl(url = "") {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(clean)) return "image";
  if (/\.(pdf|docx?|pptx?|xlsx?)$/.test(clean)) return "document";
  if (/\.(mp3|wav|ogg|m4a|aac)$/.test(clean)) return "audio";
  if (/\.(mp4|webm|mov|ogv)$/.test(clean)) return "video";
  return "file";
}
function assetNameFromUrl(url = "") { try { return decodeURIComponent(url.split("/").pop() || "Uploaded file"); } catch { return url.split("/").pop() || "Uploaded file"; } }

function MediaLibraryModal({ open, assets, onClose, onUpload, onSelect }) {
  const [tab, setTab] = useState("library");
  const [q, setQ] = useState("");
  const [type, setType] = useState("image");
  const [uploading, setUploading] = useState(false);
  const visible = useMemo(() => assets.filter((asset) => (!q || `${asset.title} ${asset.url}`.toLowerCase().includes(q.toLowerCase())) && (!type || asset.type === type)), [assets, q, type]);
  if (!open) return null;
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await onUpload(file);
      onSelect?.(uploaded);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="media-modal-backdrop" role="dialog" aria-modal="true">
      <div className="media-modal card">
        <div className="section-header media-modal-header"><div><h3>Media Library</h3><p className="lede">Upload or reuse images and files for this publication.</p><p className="upload-limit-note">{uploadLimitText}</p></div><button type="button" className="btn-sm btn-outline" onClick={onClose}>Close</button></div>
        <div className="admin-tabs-nav compact-tabs"><button className={tab === "library" ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setTab("library")}>Media Library</button><button className={tab === "upload" ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setTab("upload")}>Upload Files</button></div>
        {tab === "upload" ? <div className="wp-upload-drop"><strong>Drop or choose a file</strong><p>Images, PDF documents, audio, and video are supported. Images can be inserted directly into content.</p><p className="upload-limit-note">{uploadLimitText}</p><input type="file" accept="image/*,application/pdf,.doc,.docx,audio/*,video/*" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} />{uploading ? <p className="text-success">Uploading…</p> : null}</div> : <>
          <div className="media-library-controls"><input placeholder="Search media" value={q} onChange={(e) => setQ(e.target.value)} /><select value={type} onChange={(e) => setType(e.target.value)}><option value="image">Images</option><option value="document">Documents</option><option value="audio">Audio</option><option value="video">Video</option><option value="file">Other files</option><option value="">All files</option></select></div>
          <div className="wp-media-grid">{visible.map((asset) => <button key={`${asset.url}-${asset.title}`} type="button" className="wp-media-tile" onClick={() => onSelect(asset)}>{asset.type === "image" ? <img src={asset.url} alt={asset.alt || asset.title} /> : <span className="wp-file-icon">{asset.type}</span>}<strong>{asset.title}</strong><small>{asset.source}</small></button>)}{visible.length === 0 ? <div className="empty-text">No media found. Use the Upload Files tab to add new media.</div> : null}</div>
        </>}
      </div>
    </div>
  );
}

function PublicationPreview({ form }) {
  return (
    <article className="wp-publication-preview">
      {form.cover_image_url ? <figure><img src={form.cover_image_url} alt={form.cover_alt || form.title} />{form.cover_caption ? <figcaption>{form.cover_caption}</figcaption> : null}</figure> : null}
      <p className="publication-pill">{form.publication_type || "Publication"}</p>
      <h1>{form.title || "Untitled publication"}</h1>
      <p className="muted">{form.author ? `By ${form.author}` : "DLCF-SW"} {form.publish_date ? `• ${form.publish_date}` : ""}</p>
      {form.description ? <p className="preview-excerpt">{form.description}</p> : null}
      <div className="post-content preview-rich" dangerouslySetInnerHTML={{ __html: form.content_html || "<p>Publication content preview will appear here.</p>" }} />
    </article>
  );
}

export default function AdminPublications({ user, states = [], setStatus, canManagePublications, canPublishMedia, uploadImage }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "", q: "", publication_type: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mediaModal, setMediaModal] = useState({ open: false, mode: "insert", onSelect: null });
  const [recentUploads, setRecentUploads] = useState([]);
  const [libraryAssets, setLibraryAssets] = useState([]);
  const [saveState, setSaveState] = useState("Saved");
  const stateScoped = isStateScoped(user);
  const visibleStates = stateScoped ? (user?.state ? [user.state] : []) : states;
  const canPublish = !!canPublishMedia;
  const isEditing = editId !== "";
  const counts = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status]: items.filter((item) => item.status === status).length }), {}), [items]);
  const publishReady = checklist(form).every(([, ok]) => ok);
  const mediaAssets = useMemo(() => {
    const fromItems = items.flatMap((item) => [
      item.cover_image_url ? { url: item.cover_image_url, title: `${item.title} cover`, type: "image", source: "Publication cover" } : null,
      item.file_url ? { url: item.file_url, title: item.title || assetNameFromUrl(item.file_url), type: mediaTypeFromUrl(item.file_url), source: "Publication file" } : null,
    ]).filter(Boolean);
    const map = new Map();
    [...libraryAssets, ...recentUploads, ...fromItems].forEach((asset) => { if (asset?.url && !map.has(asset.url)) map.set(asset.url, asset); });
    return [...map.values()];
  }, [items, recentUploads, libraryAssets]);

  const effectiveForm = () => ({ ...form, scope: stateScoped ? "state" : form.scope, state: stateScoped ? user.state : form.state, is_featured: !!form.is_featured });
  const loadItems = async () => {
    try { const params = new URLSearchParams(filters); const data = await apiFetch(`/admin/publication-items?${params.toString()}`); setItems(data.items || []); }
    catch (err) { setItems([]); setStatus?.(err.message); }
  };
  const loadMediaAssets = async () => {
    try {
      const scope = effectiveForm().scope;
      const state = effectiveForm().state;
      const params = new URLSearchParams({ status: "active", limit: "80" });
      if (scope) params.set("scope", scope);
      if (state) params.set("state", state);
      const data = await apiFetch(`/admin/media-assets?${params.toString()}`);
      setLibraryAssets((data.items || []).map((asset) => ({ ...asset, type: asset.file_type, source: asset.scope === "state" ? asset.state : "Zonal library" })));
    } catch { setLibraryAssets([]); }
  };
  useEffect(() => { loadItems(); }, [filters.state, filters.status, filters.publication_type]);
  useEffect(() => {
    if (!editorOpen || !canManagePublications) return undefined;
    setSaveState("Unsaved changes");
    const id = window.setTimeout(() => setSaveState("Draft ready to save"), 900);
    return () => window.clearTimeout(id);
  }, [form, editorOpen, canManagePublications]);
  useEffect(() => {
    const warn = (event) => {
      if (editorOpen && saveState !== "Saved") {
        event.preventDefault();
        event.returnValue = "You have unsaved publication changes.";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editorOpen, saveState]);

  const resetForm = () => { setEditId(""); setForm({ ...defaultForm, scope: stateScoped ? "state" : "zonal", state: stateScoped ? user.state || "" : "" }); setEditorOpen(false); setPreviewOpen(false); setSaveState("Saved"); };
  const startNew = () => { setEditId(""); setForm({ ...defaultForm, scope: stateScoped ? "state" : "zonal", state: stateScoped ? user.state || "" : "" }); setEditorOpen(true); setSaveState("Saved"); };
  const handleFileUpload = async (file, field) => {
    if (!file || !uploadImage) return null;
    setStatus?.("Uploading file…");
    try {
      const current = effectiveForm();
      const url = await uploadImage(file, { scope: current.scope, state: current.state, usage_context: field === "file_url" ? "publication" : "publication", title: file.name });
      const asset = { url, title: file.name || assetNameFromUrl(url), type: mediaTypeFromUrl(url), source: "Just uploaded" };
      setRecentUploads((prev) => [asset, ...prev.filter((item) => item.url !== url)].slice(0, 30));
      if (field) setForm((prev) => ({ ...prev, [field]: url }));
      setStatus?.("Upload complete.");
      return asset;
    } catch (err) { setStatus?.(err.message); throw err; }
  };
  const openMediaLibrary = (mode, onSelect) => { loadMediaAssets(); setMediaModal({ open: true, mode, onSelect }); };
  const closeMediaLibrary = () => setMediaModal({ open: false, mode: "insert", onSelect: null });
  const selectMedia = (asset) => {
    if (mediaModal.onSelect) mediaModal.onSelect(asset);
    else if (mediaModal.mode === "cover") setForm((prev) => ({ ...prev, cover_image_url: asset.url, cover_alt: prev.cover_alt || asset.title }));
    else if (mediaModal.mode === "file") setForm((prev) => ({ ...prev, file_url: asset.url }));
    closeMediaLibrary();
  };
  const saveWithStatus = async (nextStatus) => {
    setStatus?.(nextStatus === "published" ? "Publishing…" : "Saving publication…");
    try {
      const payload = { ...effectiveForm(), status: nextStatus || form.status };
      if (isEditing) await apiFetch(`/admin/publication-items/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await apiFetch("/admin/publication-items", { method: "POST", body: JSON.stringify(payload) });
      await loadItems(); setSaveState("Saved"); setStatus?.(nextStatus === "published" ? "Publication published." : "Publication saved.");
      if (nextStatus === "published") resetForm();
    } catch (err) { setStatus?.(err.message); }
  };
  const archiveItem = async (item) => {
    if (!window.confirm(`Archive publication: ${item.title}?`)) return;
    setStatus?.("");
    try { await apiFetch(`/admin/publication-items/${item.id}`, { method: "DELETE" }); await loadItems(); setStatus?.("Publication archived."); }
    catch (err) { setStatus?.(err.message); }
  };
  const beginEdit = (item) => {
    setEditId(String(item.id));
    setForm({ ...defaultForm, ...item, publish_date: item.publish_date || "", pinned_until: item.pinned_until || "", scheduled_at: item.scheduled_at || "", is_featured: !!Number(item.is_featured || 0) });
    setEditorOpen(true); setSaveState("Saved");
  };

  return (
    <div className="admin-section wp-publications-admin">
      <div className="section-header"><div><h3>Publications Library</h3><p className="lede">Create, edit, review, and publish articles, outlines, manuals, and study resources with a WordPress-like editor.</p></div><div className="form-actions"><button type="button" onClick={startNew} disabled={!canManagePublications}>+ New Publication</button><button type="button" className="btn-sm btn-outline" onClick={() => openMediaLibrary("library")}>Media Library</button><button type="button" className="btn-sm btn-outline" onClick={loadItems}>Refresh</button></div></div>
      <div className="stats-grid">{statuses.map((status) => <button key={status} type="button" className={`stat-card ${filters.status === status ? "active" : ""}`} onClick={() => setFilters({ ...filters, status })}><span>{statusLabels[status]}</span><strong>{counts[status] || 0}</strong></button>)}</div>
      <div className="admin-tabs-nav compact-tabs"><button className={!filters.status ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setFilters({ ...filters, status: "" })}>All</button>{statuses.map((status) => <button key={status} className={filters.status === status ? "admin-tab-btn active" : "admin-tab-btn"} onClick={() => setFilters({ ...filters, status })}>{statusLabels[status]}</button>)}</div>

      {editorOpen && canManagePublications ? <div className="wp-editor-shell card">
        <div className="wp-editor-topbar"><button type="button" className="btn-sm btn-outline" onClick={() => { if (saveState !== "Saved" && !window.confirm("Close editor with unsaved changes?")) return; resetForm(); }}>← Back to list</button><span className="muted">{saveState}</span><div className="form-actions"><button type="button" className="btn-sm btn-outline" onClick={() => saveWithStatus("draft")}>Save Draft</button><button type="button" className="btn-sm btn-outline" onClick={() => setPreviewOpen((open) => !open)}>Preview</button><button type="button" onClick={() => saveWithStatus("submitted")}>Submit for Review</button>{canPublish ? <button type="button" onClick={() => saveWithStatus("published")} disabled={!publishReady}>Publish Now</button> : null}</div></div>
        <div className="wp-editor-layout">
          <main className="wp-editor-main">
            <input className="wp-title-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, seo_title: form.seo_title || e.target.value })} placeholder="Add publication title" required />
            <div className="grid-2"><label>Slug<input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if blank" /></label><label>Author<input value={form.author || ""} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="DLCF-SW" /></label></div>
            <div className="rich-field"><label>Publication Content</label><RichTextEditor value={form.content_html || ""} onChange={(value) => setForm({ ...form, content_html: value })} onUploadImage={uploadImage ? (file) => handleFileUpload(file).then((asset) => asset?.url) : null} onOpenMediaLibrary={(insertAsset) => openMediaLibrary("insert", insertAsset)} /></div>
            <label>Excerpt / Summary<textarea rows="4" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value, seo_description: form.seo_description || e.target.value.slice(0, 160) })} placeholder="Short summary for listing pages and previews" /></label>
            {form.file_url ? <div className="upload-preview"><strong>Attached publication file</strong><p><a href={form.file_url} target="_blank" rel="noreferrer">{assetNameFromUrl(form.file_url)}</a></p></div> : null}
            {previewOpen ? <PublicationPreview form={form} /> : null}
          </main>
          <aside className="wp-editor-sidebar">
            <div className="card soft-card"><h4>Workflow</h4><StatusBadge value={form.status} /><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((status) => <option key={status} value={status} disabled={["approved", "scheduled", "published", "archived", "rejected"].includes(status) && !canPublish}>{statusLabels[status]}</option>)}</select></label><label>Review / Change Notes<textarea rows="3" value={form.workflow_note || ""} onChange={(e) => setForm({ ...form, workflow_note: e.target.value })} /></label>{canPublish ? <div className="form-actions stacked"><button type="button" onClick={() => saveWithStatus("approved")} disabled={!publishReady}>Mark Approved</button><button type="button" onClick={() => saveWithStatus("scheduled")} disabled={!publishReady}>Schedule</button></div> : null}</div>
            <div className="card soft-card"><h4>Featured Image</h4>{form.cover_image_url ? <figure className="featured-image-preview"><img src={form.cover_image_url} alt={form.cover_alt || form.title} />{form.cover_caption ? <figcaption>{form.cover_caption}</figcaption> : null}</figure> : <div className="featured-placeholder">No featured image selected</div>}<div className="form-actions stacked"><p className="upload-limit-note">Images up to 25MB.</p><label className="button-like-upload">Upload Featured Image<input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0], "cover_image_url")} /></label><button type="button" className="btn-sm btn-outline" onClick={() => openMediaLibrary("cover")}>Choose from Library</button>{form.cover_image_url ? <button type="button" className="btn-sm btn-danger" onClick={() => setForm({ ...form, cover_image_url: "" })}>Remove</button> : null}</div><label>Alt Text<input value={form.cover_alt || ""} onChange={(e) => setForm({ ...form, cover_alt: e.target.value })} /></label><label>Caption<input value={form.cover_caption || ""} onChange={(e) => setForm({ ...form, cover_caption: e.target.value })} /></label></div>
            <div className="card soft-card"><h4>Publication Details</h4><label>Publication Type / Category<input value={form.publication_type} onChange={(e) => setForm({ ...form, publication_type: e.target.value })} placeholder="Manual, Outline, Magazine…" required /></label><label>Tags<input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="comma-separated" /></label><label>Publish Date<input type="date" value={form.publish_date || ""} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></label><label>Visibility<select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}><option value="public">Public</option><option value="members">Members</option><option value="leaders">Leaders</option><option value="private">Private</option></select></label><label><input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} disabled={!canUseZonalScope(user)} /> Featured</label></div>
            <div className="card soft-card"><h4>Scope</h4><label>Scope<select value={stateScoped ? "state" : form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value, state: e.target.value === "zonal" ? "" : form.state })} disabled={!canUseZonalScope(user)}><option value="zonal">Zonal</option><option value="state">State</option></select></label><label>State<select value={stateScoped ? user.state || "" : form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={stateScoped || form.scope !== "state"}><option value="">Select state</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></label></div>
            <div className="card soft-card"><h4>SEO</h4><label>SEO Title<input value={form.seo_title || ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></label><label>SEO Description<textarea rows="3" value={form.seo_description || ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></label><label>Publication File / PDF<input value={form.file_url || ""} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></label><div className="form-actions stacked"><p className="upload-limit-note">PDF/documents up to 50MB.</p><label className="button-like-upload">Upload PDF/File<input type="file" accept="application/pdf,.doc,.docx" onChange={(e) => handleFileUpload(e.target.files?.[0], "file_url")} /></label><button type="button" className="btn-sm btn-outline" onClick={() => openMediaLibrary("file")}>Choose File</button></div></div>
            <div className="card soft-card"><strong>Publish checklist</strong>{checklist(form).map(([label, ok]) => <p key={label} className={ok ? "text-success" : "text-danger"}>{ok ? "✓" : "•"} {label}</p>)}</div>
          </aside>
        </div>
      </div> : null}

      <div className="table-container card"><div className="section-header"><h4>Publication Items</h4><div className="form-actions"><input placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} onBlur={loadItems} /><select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} disabled={stateScoped}><option value="">All states</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select><input placeholder="Type" value={filters.publication_type} onChange={(e) => setFilters({ ...filters, publication_type: e.target.value })} onBlur={loadItems} /></div></div><table className="data-table"><thead><tr><th>Title</th><th>Type</th><th>Scope</th><th>Status</th><th>Visibility</th><th>Date</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className={String(item.id) === editId ? "active-row" : ""}><td><strong>{item.title}</strong><br /><small className="muted">{htmlToText(item.description || item.content_html || "").slice(0, 90)}</small></td><td>{item.publication_type}</td><td>{item.scope === "state" ? item.state || "State" : "Zonal"}</td><td><StatusBadge value={item.status} /></td><td>{item.visibility || "public"}</td><td>{item.publish_date || "-"}</td><td className="actions-cell">{canManagePublications ? <><button className="btn-sm btn-outline" onClick={() => beginEdit(item)}>Edit</button><button className="btn-sm btn-outline" onClick={() => { beginEdit(item); setPreviewOpen(true); }}>Preview</button>{canPublish ? <button className="btn-sm btn-danger" onClick={() => archiveItem(item)}>{item.status === "archived" ? "Archived" : "Archive"}</button> : null}</> : <span>-</span>}</td></tr>)}{items.length === 0 ? <tr><td colSpan="7">No publications match this view.</td></tr> : null}</tbody></table></div>
      {!canManagePublications ? <div className="card"><p className="lede">You have read-only access to publications.</p></div> : null}
      <MediaLibraryModal open={mediaModal.open} assets={mediaAssets} onClose={closeMediaLibrary} onSelect={selectMedia} onUpload={(file) => handleFileUpload(file)} />
    </div>
  );
}
