import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import RichTextEditor from "../RichTextEditor";

const defaultForm = {
  title: "",
  slug: "",
  summary: "",
  description_html: "",
  campaign_type: "project",
  cover_image_url: "",
  target_amount: "",
  amount_raised: "",
  beneficiary_name: "",
  payment_details: "",
  deadline: "",
  is_urgent: false,
  is_featured: false,
  scope: "zonal",
  state: "",
  status: "draft",
};

export default function AdminGiving({
  user,
  states = [],
  setStatus,
  canManageGiving,
  uploadImage,
}) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", status: "" });
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({ ...defaultForm });
  const isStateScopedAdmin = user && ["state_cord", "state_admin"].includes(user.role);
  const visibleStates = isStateScopedAdmin ? (user.state ? [user.state] : []) : states;

  const isEditing = useMemo(() => editId !== "", [editId]);

  const loadItems = async () => {
    try {
      const params = new URLSearchParams(filters);
      const data = await apiFetch(`/admin/giving-campaigns?${params.toString()}`);
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

  const handleFileUpload = async (file) => {
    if (!file || !uploadImage) return;
    if (setStatus) setStatus("");
    try {
      const url = await uploadImage(file);
      if (url) {
        setForm((prev) => ({ ...prev, cover_image_url: url }));
      }
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
        scope: isStateScopedAdmin ? "state" : form.scope,
        state: isStateScopedAdmin ? user.state : form.state,
        is_featured: isStateScopedAdmin ? false : form.is_featured,
        target_amount: form.target_amount === "" ? 0 : Number(form.target_amount),
        amount_raised: form.amount_raised === "" ? 0 : Number(form.amount_raised),
      };
      if (isEditing) {
        await apiFetch(`/admin/giving-campaigns/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin/giving-campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      loadItems();
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this giving campaign?")) return;
    if (setStatus) setStatus("");
    try {
      await apiFetch(`/admin/giving-campaigns/${id}`, { method: "DELETE" });
      loadItems();
    } catch (err) {
      if (setStatus) setStatus(err.message);
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h3>Giving Campaigns</h3>
      </div>

      <div className="panel-content">
        {canManageGiving ? (
          <div className="form-card card">
            <h4>{isEditing ? "Edit Campaign" : "Add Campaign"}</h4>
            <form onSubmit={handleSubmit} className="form compact-form">
              <div className="grid-2">
                <label>
                  Title
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </label>
                <label>
                  Slug (optional)
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </label>
              </div>
              <label>
                Summary
                <textarea rows="3" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </label>
              <div className="rich-field">
                <label>Campaign Details</label>
                <RichTextEditor
                  value={form.description_html}
                  onChange={(value) => setForm({ ...form, description_html: value })}
                  onUploadImage={uploadImage}
                />
              </div>
              <div className="grid-2">
                <label>
                  Campaign Type
                  <select value={form.campaign_type} onChange={(e) => setForm({ ...form, campaign_type: e.target.value })}>
                    <option value="project">Project</option>
                    <option value="urgent_help">Urgent Help</option>
                    <option value="ministry_support">Ministry Support</option>
                    <option value="special_appeal">Special Appeal</option>
                  </select>
                </label>
                <label>
                  Beneficiary / Project Owner
                  <input type="text" value={form.beneficiary_name} onChange={(e) => setForm({ ...form, beneficiary_name: e.target.value })} />
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Cover Image URL
                  <input type="text" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
                </label>
                <label>
                  Upload Cover Image
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0])} />
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Target Amount
                  <input type="number" min="0" step="0.01" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
                </label>
                <label>
                  Amount Raised
                  <input type="number" min="0" step="0.01" value={form.amount_raised} onChange={(e) => setForm({ ...form, amount_raised: e.target.value })} />
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Deadline
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </label>
                <label>
                  Status
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
              </div>
              <div className="grid-2">
                <label>
                  Scope
                  <select value={isStateScopedAdmin ? "state" : form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} disabled={!!isStateScopedAdmin}>
                    <option value="zonal">Zonal</option>
                    <option value="state">State</option>
                  </select>
                </label>
                <label>
                  State
                  <select value={isStateScopedAdmin ? user.state : form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={!!isStateScopedAdmin || form.scope !== "state"}>
                    <option value="">Select state</option>
                    {visibleStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Payment Details / Instructions
                <textarea rows="4" value={form.payment_details} onChange={(e) => setForm({ ...form, payment_details: e.target.value })} placeholder="Bank details, instructions, account name, reference format..." />
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={!!form.is_urgent} onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })} />
                <span>Mark as urgent</span>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={isStateScopedAdmin ? false : !!form.is_featured} disabled={!!isStateScopedAdmin} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                <span>Feature on homepage</span>
              </label>
              <div className="form-actions">
                <button type="submit">{isEditing ? "Update" : "Add"}</button>
                {isEditing ? <button type="button" onClick={resetForm}>Cancel</button> : null}
              </div>
            </form>
          </div>
        ) : (
          <div className="card">
            <p className="lede">You have read-only access to giving campaigns.</p>
          </div>
        )}

        <div className="table-container card">
          <div className="section-header">
            <h4>Campaign Items</h4>
            <div className="form-actions">
              <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}>
                <option value="">All states</option>
                {visibleStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Scope</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Goal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={String(item.id) === editId ? "active-row" : ""}>
                  <td>{item.title}</td>
                  <td>{item.campaign_type}</td>
                  <td>{item.scope === "state" ? item.state || "State" : "Zonal"}</td>
                  <td>{Number(item.is_featured) ? "Yes" : "—"}</td>
                  <td>{item.status}</td>
                  <td>{Number(item.target_amount || 0).toLocaleString()}</td>
                  <td className="actions-cell">
                    {canManageGiving ? (
                      <>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => {
                            setEditId(String(item.id));
                            setForm({
                              title: item.title || "",
                              slug: item.slug || "",
                              summary: item.summary || "",
                              description_html: item.description_html || "",
                              campaign_type: item.campaign_type || "project",
                              cover_image_url: item.cover_image_url || "",
                              target_amount: item.target_amount || "",
                              amount_raised: item.amount_raised || "",
                              beneficiary_name: item.beneficiary_name || "",
                              payment_details: item.payment_details || "",
                              deadline: item.deadline || "",
                              is_urgent: Boolean(Number(item.is_urgent || 0)),
                              is_featured: Boolean(Number(item.is_featured || 0)),
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
                  <td colSpan="7">No giving campaigns yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
