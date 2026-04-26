import { useEffect, useState } from "react";
import { apiFetch, ensureCsrf } from "../api";

const emptyTemplate = { channel: "whatsapp", name: "", subject: "", body: "", is_active: true };

export default function FollowupTemplatesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyTemplate);
  const [status, setStatus] = useState("");

  const load = async () => {
    try {
      const data = await apiFetch("/followups/templates");
      setItems(data.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    await ensureCsrf();
    try {
      if (form.id) {
        await apiFetch(`/followups/templates/${form.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/followups/templates", { method: "POST", body: JSON.stringify(form) });
      }
      setForm(emptyTemplate);
      setStatus("Template saved.");
      load();
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <section className="card retreat-page">
      <div className="retreat-head"><div><p className="eyebrow">Message Templates</p><h2>Follow-up Email & WhatsApp Templates</h2><p className="lede">Use variables: {"{{name}}"}, {"{{fellowship_centre}}"}, {"{{state}}"}, {"{{region}}"}, {"{{worker_name}}"}, {"{{contact_phone}}"}</p></div></div>
      {status ? <div className="status">{status}</div> : null}
      <form className="form card" onSubmit={save}>
        <div className="grid">
          <label>Channel<select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></label>
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Subject<input value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={form.channel !== "email"} /></label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}><input type="checkbox" checked={form.is_active !== false && Number(form.is_active) !== 0} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        </div>
        <label>Body<textarea rows="7" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></label>
        <div className="form-actions"><button type="submit">{form.id ? "Update Template" : "Create Template"}</button><button type="button" className="btn-outline" onClick={() => setForm(emptyTemplate)}>New</button></div>
      </form>
      <div className="table-wrap" style={{ marginTop: 16, overflowX: "auto" }}>
        <table className="report-table"><thead><tr><th>Name</th><th>Channel</th><th>Subject</th><th>Active</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.channel}</td><td>{item.subject || "—"}</td><td>{Number(item.is_active) === 1 ? "Yes" : "No"}</td><td><button type="button" className="btn-outline" onClick={() => setForm(item)}>Edit</button></td></tr>)}</tbody></table>
      </div>
    </section>
  );
}
