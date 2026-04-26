import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, ensureCsrf } from "../api";

const statuses = ["new", "assigned", "contacted", "no_response", "unreachable", "interested", "needs_visit", "joined_fellowship", "converted_to_member", "closed"];

export default function FollowupDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState({ contact: null, notes: [], message_logs: [] });
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({});
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setStatus("Loading follow-up record...");
    try {
      const [detail, assignable, templateList] = await Promise.all([
        apiFetch(`/followups/contacts/${id}`),
        apiFetch("/followups/assignable-users"),
        apiFetch("/followups/templates"),
      ]);
      setData(detail);
      setForm(detail.contact || {});
      setUsers(assignable.items || []);
      setTemplates(templateList.items || []);
      setStatus("");
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveTask = async () => {
    await ensureCsrf();
    await apiFetch(`/followups/tasks/${form.task_id}/status`, { method: "PUT", body: JSON.stringify({ status: form.status, priority: form.priority, due_date: form.due_date, next_followup_at: form.next_followup_at }) });
    if (String(form.assigned_to_user_id || "") !== String(data.contact?.assigned_to_user_id || "")) {
      await apiFetch(`/followups/tasks/${form.task_id}/assign`, { method: "PUT", body: JSON.stringify({ assigned_to_user_id: form.assigned_to_user_id, due_date: form.due_date }) });
    }
    setStatus("Follow-up task updated.");
    load();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await ensureCsrf();
    await apiFetch(`/followups/tasks/${form.task_id}/notes`, { method: "POST", body: JSON.stringify({ content: note }) });
    setNote("");
    load();
  };

  const send = async (channel) => {
    const template = templates.find((t) => t.channel === channel);
    setStatus(`Sending ${channel}...`);
    await ensureCsrf();
    try {
      await apiFetch(`/followups/tasks/${form.task_id}/${channel}`, { method: "POST", body: JSON.stringify({ template_id: template?.id }) });
      setStatus(`${channel === "whatsapp" ? "WhatsApp" : "Email"} attempt logged.`);
      load();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const openWhatsappFallback = async () => {
    const template = templates.find((t) => t.channel === "whatsapp");
    const res = await apiFetch(`/followups/tasks/${form.task_id}/whatsapp-link${template ? `?template_id=${template.id}` : ""}`);
    if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
  };

  if (!data.contact) {
    return <section className="card">{status || "Loading..."}</section>;
  }

  return (
    <section className="retreat-page">
      <div className="retreat-head card">
        <div><p className="eyebrow">Follow-up detail</p><h2>{data.contact.full_name}</h2><p className="lede">{data.contact.decision_type} • {data.contact.source_type}</p></div>
        <Link className="ghost" to="/followups">Back to Follow-up</Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      <div className="portal-grid" style={{ gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)", alignItems: "start" }}>
        <div>
          <section className="card">
            <h3>Contact Profile</h3>
            <p><strong>Phone:</strong> {data.contact.phone || "—"}</p>
            <p><strong>Email:</strong> {data.contact.email || "—"}</p>
            <p><strong>Gender/category:</strong> {data.contact.gender || "—"} / {data.contact.category || "—"}</p>
            <p><strong>Address:</strong> {data.contact.address || "—"}</p>
            <p><strong>Centre:</strong> {data.contact.fellowship_centre || "—"}</p>
            <p><strong>State/Region:</strong> {data.contact.state || "—"} / {data.contact.region || "—"}</p>
            <p><strong>Consent:</strong> {Number(data.contact.consent_to_contact) === 1 ? "Yes" : "No"}</p>
            <p><strong>Notes:</strong> {data.contact.notes || "—"}</p>
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Assignment & Status</h3>
            <div className="grid">
              <label>Assigned worker<select value={form.assigned_to_user_id || ""} onChange={(e) => setForm({ ...form, assigned_to_user_id: e.target.value })}><option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
              <label>Status<select value={form.status || "new"} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label>Priority<select value={form.priority || "normal"} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
              <label>Due date<input type="date" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
              <label>Next follow-up<input type="datetime-local" value={(form.next_followup_at || "").replace(" ", "T").slice(0, 16)} onChange={(e) => setForm({ ...form, next_followup_at: e.target.value.replace("T", " ") })} /></label>
            </div>
            <div className="form-actions"><button type="button" onClick={saveTask}>Save</button></div>
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Message Actions</h3>
            <p className="small-text">Templates are rendered server-side. Evolution API secrets are never exposed to the browser.</p>
            <div className="form-actions"><button type="button" onClick={() => send("whatsapp")}>Send WhatsApp</button><button type="button" className="btn-outline" onClick={openWhatsappFallback}>Open WhatsApp Fallback</button><button type="button" onClick={() => send("email")}>Send Email</button></div>
          </section>
        </div>
        <div>
          <section className="card">
            <h3>Notes Timeline</h3>
            <label>Add note<textarea value={note} onChange={(e) => setNote(e.target.value)} rows="3" /></label>
            <div className="form-actions"><button type="button" onClick={addNote}>Add Note</button></div>
            {data.notes.length === 0 ? <p className="small-text">No notes yet.</p> : data.notes.map((item) => <div key={item.id} className="status" style={{ marginTop: 8 }}><strong>{item.user_name || "User"}</strong> • {item.created_at}<br />{item.content}</div>)}
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Message History</h3>
            {data.message_logs.length === 0 ? <p className="small-text">No message attempts yet.</p> : data.message_logs.map((log) => <div key={log.id} className="status" style={{ marginTop: 8 }}><strong>{log.channel}</strong> • {log.status} • {log.created_at}<br />To: {log.recipient}<br />{log.error_message ? `Error: ${log.error_message}` : log.subject || log.template_name}</div>)}
          </section>
        </div>
      </div>
    </section>
  );
}
