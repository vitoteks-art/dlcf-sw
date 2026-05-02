import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";

const fileTypes = ["", "image", "document", "audio", "video", "other"];
const statuses = ["active", "archived", "deleted"];
const uploadLimitText = "Upload limits: images up to 25MB, PDF/documents up to 50MB, audio up to 75MB, video up to 100MB.";
const isStateScoped = (user) => user && ["state_cord", "state_admin"].includes(user.role);
const canUseZonalScope = (user) => user && ["administrator", "zonal_cord", "zonal_admin"].includes(user.role);

function formatSize(bytes) {
  const size = Number(bytes || 0);
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)}MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${size}B`;
}
function assetName(asset) { return asset.title || asset.original_filename || asset.stored_filename || "Uploaded file"; }

export default function AdminFileManager({ user, states = [], setStatus, uploadImage }) {
  const stateScoped = isStateScoped(user);
  const visibleStates = stateScoped ? (user?.state ? [user.state] : []) : states;
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ q: "", file_type: "", scope: "", state: "", status: "active", usage_context: "" });
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ scope: stateScoped ? "state" : "zonal", state: stateScoped ? user?.state || "" : "", usage_context: "general", title: "", alt_text: "", caption: "", description: "" });
  const summary = useMemo(() => ({
    total: items.length,
    images: items.filter((item) => item.file_type === "image").length,
    documents: items.filter((item) => item.file_type === "document").length,
    audio: items.filter((item) => item.file_type === "audio").length,
    video: items.filter((item) => item.file_type === "video").length,
    archived: items.filter((item) => item.status === "archived").length,
    size: items.reduce((sum, item) => sum + Number(item.file_size || 0), 0),
  }), [items]);

  const loadItems = async () => {
    try {
      const params = new URLSearchParams(filters);
      const data = await apiFetch(`/admin/media-assets?${params.toString()}`);
      setItems(data.items || []);
    } catch (err) { setStatus?.(err.message); setItems([]); }
  };
  useEffect(() => { loadItems(); }, [filters.file_type, filters.scope, filters.state, filters.status, filters.usage_context]);

  const handleUpload = async (file) => {
    if (!file || !uploadImage) return;
    setUploading(true); setStatus?.("Uploading file…");
    try {
      await uploadImage(file, uploadForm);
      setStatus?.("File uploaded.");
      setUploadForm((prev) => ({ ...prev, title: "", alt_text: "", caption: "", description: "" }));
      await loadItems();
    } catch (err) { setStatus?.(err.message); }
    finally { setUploading(false); }
  };
  const updateAsset = async () => {
    if (!selected) return;
    try {
      await apiFetch(`/admin/media-assets/${selected.id}`, { method: "PUT", body: JSON.stringify(selected) });
      setStatus?.("File details updated."); await loadItems();
    } catch (err) { setStatus?.(err.message); }
  };
  const archiveAsset = async (asset) => {
    if (!window.confirm(`Archive ${assetName(asset)}? It can be restored later.`)) return;
    try { await apiFetch(`/admin/media-assets/${asset.id}/archive`, { method: "POST", body: JSON.stringify({}) }); setStatus?.("File archived."); await loadItems(); }
    catch (err) { setStatus?.(err.message); }
  };
  const restoreAsset = async (asset) => {
    try { await apiFetch(`/admin/media-assets/${asset.id}/restore`, { method: "POST", body: JSON.stringify({}) }); setStatus?.("File restored."); await loadItems(); }
    catch (err) { setStatus?.(err.message); }
  };
  const deleteAsset = async (asset) => {
    const usage = Number(asset.usage_count || 0);
    const warning = usage > 0 ? `This file is used in ${usage} place(s). Deleting it may break public content. Continue?` : `Delete ${assetName(asset)} from the dashboard?`;
    if (!window.confirm(warning)) return;
    try { await apiFetch(`/admin/media-assets/${asset.id}`, { method: "DELETE" }); setStatus?.("File deleted from dashboard."); setSelected(null); await loadItems(); }
    catch (err) { setStatus?.(err.message); }
  };

  return <div className="admin-section file-manager-admin">
    <div className="section-header"><div><h3>File Manager</h3><p className="lede">Manage uploaded images, documents, audio, and video files by zonal or state ownership.</p><p className="upload-limit-note">{uploadLimitText}</p></div><button type="button" className="btn-sm btn-outline" onClick={loadItems}>Refresh</button></div>
    <div className="stats-grid"><button className="stat-card" onClick={() => setFilters({ ...filters, file_type: "" })}><span>Total files</span><strong>{summary.total}</strong></button><button className="stat-card" onClick={() => setFilters({ ...filters, file_type: "image" })}><span>Images</span><strong>{summary.images}</strong></button><button className="stat-card" onClick={() => setFilters({ ...filters, file_type: "document" })}><span>Documents</span><strong>{summary.documents}</strong></button><button className="stat-card" onClick={() => setFilters({ ...filters, file_type: "audio" })}><span>Audio</span><strong>{summary.audio}</strong></button><button className="stat-card" onClick={() => setFilters({ ...filters, file_type: "video" })}><span>Video</span><strong>{summary.video}</strong></button><button className="stat-card"><span>Storage shown</span><strong>{formatSize(summary.size)}</strong></button></div>
    <div className="card form-card"><h4>Upload File</h4><div className="form compact-form"><div className="grid-2"><label>Scope<select value={stateScoped ? "state" : uploadForm.scope} disabled={!canUseZonalScope(user)} onChange={(e) => setUploadForm({ ...uploadForm, scope: e.target.value, state: e.target.value === "zonal" ? "" : uploadForm.state })}><option value="zonal">Zonal</option><option value="state">State</option></select></label><label>State<select value={stateScoped ? user?.state || "" : uploadForm.state} disabled={stateScoped || uploadForm.scope !== "state"} onChange={(e) => setUploadForm({ ...uploadForm, state: e.target.value })}><option value="">Select state</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></label></div><div className="grid-2"><label>Title<input value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></label><label>Usage Context<select value={uploadForm.usage_context} onChange={(e) => setUploadForm({ ...uploadForm, usage_context: e.target.value })}><option value="general">General</option><option value="publication">Publication</option><option value="media">Media</option><option value="gallery">Gallery</option><option value="homepage">Homepage</option><option value="giving">Giving</option></select></label></div><div className="grid-2"><label>Alt Text<input value={uploadForm.alt_text} onChange={(e) => setUploadForm({ ...uploadForm, alt_text: e.target.value })} /></label><label>Caption<input value={uploadForm.caption} onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })} /></label></div><label>Description<textarea rows="2" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} /></label><label className="button-like-upload">{uploading ? "Uploading…" : "Choose File to Upload"}<input type="file" disabled={uploading} accept="image/*,application/pdf,.doc,.docx,audio/*,video/*" onChange={(e) => handleUpload(e.target.files?.[0])} /></label></div></div>
    <div className="card"><div className="section-header"><h4>Uploaded Files</h4><div className="form-actions"><input placeholder="Search files" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} onBlur={loadItems} /><select value={filters.file_type} onChange={(e) => setFilters({ ...filters, file_type: e.target.value })}>{fileTypes.map((type) => <option key={type} value={type}>{type ? type : "All types"}</option>)}</select><select value={filters.scope} onChange={(e) => setFilters({ ...filters, scope: e.target.value, state: e.target.value === "zonal" ? "" : filters.state })}><option value="">All scopes</option><option value="zonal">Zonal</option><option value="state">State</option></select><select value={filters.state} disabled={stateScoped || filters.scope === "zonal"} onChange={(e) => setFilters({ ...filters, state: e.target.value })}><option value="">All states</option>{visibleStates.map((state) => <option key={state} value={state}>{state}</option>)}</select><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div>
      <div className="file-manager-grid">{items.map((asset) => <div key={asset.id} className="file-card"><button type="button" className="file-preview" onClick={() => setSelected(asset)}>{asset.file_type === "image" ? <img src={asset.url} alt={asset.alt_text || assetName(asset)} /> : <span className="wp-file-icon">{asset.file_type}</span>}</button><strong>{assetName(asset)}</strong><small>{asset.scope === "state" ? asset.state : "Zonal"} • {formatSize(asset.file_size)}</small><small>{asset.usage_count > 0 ? `Used in ${asset.usage_count} place(s)` : "Not used"}</small><div className="form-actions"><button className="btn-sm btn-outline" onClick={() => setSelected(asset)}>Details</button>{asset.status === "archived" || asset.status === "deleted" ? <button className="btn-sm btn-outline" onClick={() => restoreAsset(asset)}>Restore</button> : <button className="btn-sm btn-outline" onClick={() => archiveAsset(asset)}>Archive</button>}<button className="btn-sm btn-danger" onClick={() => deleteAsset(asset)}>Delete</button></div></div>)}{items.length === 0 ? <p className="lede">No files found for this view.</p> : null}</div>
    </div>
    {selected ? <div className="media-modal-backdrop"><div className="media-modal card"><div className="section-header"><h3>File Details</h3><button className="btn-sm btn-outline" onClick={() => setSelected(null)}>Close</button></div>{selected.file_type === "image" ? <img className="file-detail-image" src={selected.url} alt={selected.alt_text || assetName(selected)} /> : <p><a href={selected.url} target="_blank" rel="noreferrer">Open file</a></p>}<div className="form compact-form"><label>Title<input value={selected.title || ""} onChange={(e) => setSelected({ ...selected, title: e.target.value })} /></label><label>URL<input value={selected.url || ""} readOnly onFocus={(e) => e.target.select()} /></label><div className="grid-2"><label>Alt Text<input value={selected.alt_text || ""} onChange={(e) => setSelected({ ...selected, alt_text: e.target.value })} /></label><label>Usage Context<input value={selected.usage_context || ""} onChange={(e) => setSelected({ ...selected, usage_context: e.target.value })} /></label></div><label>Caption<input value={selected.caption || ""} onChange={(e) => setSelected({ ...selected, caption: e.target.value })} /></label><label>Description<textarea rows="3" value={selected.description || ""} onChange={(e) => setSelected({ ...selected, description: e.target.value })} /></label><p className="upload-limit-note">{selected.usage_count > 0 ? `Warning: this file is used in ${selected.usage_count} place(s).` : "This file is not currently detected in content."}</p><div className="form-actions"><button onClick={updateAsset}>Save Details</button><button className="btn-sm btn-outline" onClick={() => navigator.clipboard?.writeText(selected.url)}>Copy URL</button>{selected.status === "archived" || selected.status === "deleted" ? <button className="btn-sm btn-outline" onClick={() => restoreAsset(selected)}>Restore</button> : <button className="btn-sm btn-outline" onClick={() => archiveAsset(selected)}>Archive</button>}<button className="btn-sm btn-danger" onClick={() => deleteAsset(selected)}>Delete</button></div></div></div></div> : null}
  </div>;
}
