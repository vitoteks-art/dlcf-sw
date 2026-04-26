import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ensureCsrf } from "../api";

const statuses = ["", "new", "assigned", "contacted", "no_response", "unreachable", "interested", "needs_visit", "joined_fellowship", "converted_to_member", "closed"];

export default function FollowupDashboardPage({ states = [] }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", state: "", region: "", source_type: "", status: "", decision_type: "", assigned_to: "", start: "", end: "" });
  const [status, setStatus] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value ? p.set(key, value) : null);
    return p.toString();
  }, [filters]);

  const load = async () => {
    setStatus("Loading follow-up records...");
    try {
      const [list, stats, assignable] = await Promise.all([
        apiFetch(`/followups/contacts?${params}`),
        apiFetch("/followups/summary"),
        apiFetch("/followups/assignable-users"),
      ]);
      setItems(list.items || []);
      setSummary(stats.summary || {});
      setUsers(assignable.items || []);
      setStatus("");
    } catch (err) {
      setStatus(err.message || "Unable to load follow-up records. Please try again.");
    }
  };

  useEffect(() => { load(); }, [params]);

  const assign = async (taskId, userId) => {
    await ensureCsrf();
    await apiFetch(`/followups/tasks/${taskId}/assign`, { method: "PUT", body: JSON.stringify({ assigned_to_user_id: userId }) });
    load();
  };

  const quickStatus = async (taskId, nextStatus) => {
    await ensureCsrf();
    await apiFetch(`/followups/tasks/${taskId}/status`, { method: "PUT", body: JSON.stringify({ status: nextStatus }) });
    load();
  };

  const send = async (taskId, channel) => {
    setStatus(`Sending ${channel}...`);
    await ensureCsrf();
    try {
      await apiFetch(`/followups/tasks/${taskId}/${channel}`, { method: "POST", body: JSON.stringify({}) });
      setStatus(`${channel === "whatsapp" ? "WhatsApp" : "Email"} attempt logged.`);
      load();
    } catch (err) {
      setStatus(err.message);
    }
  };

  const card = (label, key, filterStatus) => (
    <button type="button" className="card" onClick={() => filterStatus ? setFilters((prev) => ({ ...prev, status: filterStatus })) : null} style={{ textAlign: "left" }}>
      <p className="eyebrow">{label}</p>
      <h2>{Number(summary[key] || 0)}</h2>
    </button>
  );

  return (
    <section className="card retreat-page">
      <div className="retreat-head">
        <div>
          <p className="eyebrow">Follow-up</p>
          <h2>Visitor & Convert Follow-up</h2>
          <p className="lede">Track assignments, WhatsApp/email attempts, and outcomes.</p>
        </div>
        <Link className="ghost" to="/followups/templates">Message Templates</Link>
      </div>
      {status ? <div className="status">{status}</div> : null}
      <div className="portal-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {card("New / Unassigned", "unassigned", "new")}
        {card("Assigned Pending", "assigned_pending", "assigned")}
        {card("Overdue", "overdue")}
        {card("Contacted This Week", "contacted_this_week", "contacted")}
        {card("Converted to Member", "converted_to_member", "converted_to_member")}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="grid">
          <label>Search<input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Name, phone, email" /></label>
          <label>State<select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}><option value="">All</option>{states.map((state) => <option key={state}>{state}</option>)}</select></label>
          <label>Source<select value={filters.source_type} onChange={(e) => setFilters({ ...filters, source_type: e.target.value })}><option value="">All</option><option value="attendance">Attendance</option><option value="gck">GCK</option><option value="manual">Manual</option></select></label>
          <label>Status<select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s || "All"}</option>)}</select></label>
          <label>Decision<select value={filters.decision_type} onChange={(e) => setFilters({ ...filters, decision_type: e.target.value })}><option value="">All</option><option value="visitor">Visitor</option><option value="convert">Convert</option><option value="first_timer">First timer</option><option value="recommitment">Recommitment</option></select></label>
          <label>Assigned worker<select value={filters.assigned_to} onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}><option value="">All</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        </div>
      </div>
      <div className="table-wrap" style={{ marginTop: 16, overflowX: "auto" }}>
        <table className="report-table">
          <thead><tr><th>Name</th><th>Decision</th><th>Phone / Email</th><th>Source</th><th>Centre</th><th>Assigned To</th><th>Status</th><th>Due</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="9">No follow-up records found for this filter.</td></tr> : items.map((item) => (
              <tr key={item.task_id}>
                <td><Link to={`/followups/${item.id}`}>{item.full_name}</Link></td>
                <td>{item.decision_type}</td>
                <td>{item.phone || "—"}<br />{item.email || "—"}</td>
                <td>{item.source_type}</td>
                <td>{item.fellowship_centre || item.state || "—"}</td>
                <td><select value={item.assigned_to_user_id || ""} onChange={(e) => assign(item.task_id, e.target.value)}><option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></td>
                <td>{item.status}</td>
                <td>{item.due_date || item.next_followup_at || "—"}</td>
                <td className="form-actions"><Link className="btn-outline" to={`/followups/${item.id}`}>Open</Link><button type="button" className="btn-outline" onClick={() => send(item.task_id, "whatsapp")}>WhatsApp</button><button type="button" className="btn-outline" onClick={() => send(item.task_id, "email")}>Email</button><button type="button" className="btn-outline" onClick={() => quickStatus(item.task_id, "contacted")}>Mark Contacted</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
