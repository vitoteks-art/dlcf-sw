import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function FollowupReportPage() {
  const [summary, setSummary] = useState({});
  const [byStatus, setByStatus] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    try {
      const [stats, overdueRows] = await Promise.all([apiFetch("/followups/summary"), apiFetch("/followups/overdue")]);
      setSummary(stats.summary || {});
      setByStatus(stats.by_status || []);
      setOverdue(overdueRows.items || []);
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="card retreat-page">
      <div className="retreat-head"><div><p className="eyebrow">Follow-up Reports</p><h2>Follow-up Outcomes</h2><p className="lede">Pending, contacted, overdue, and converted records.</p></div><button type="button" className="btn-outline" onClick={load}>Refresh</button></div>
      {status ? <div className="status">{status}</div> : null}
      <div className="portal-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[["Total", "total"], ["Unassigned", "unassigned"], ["Assigned Pending", "assigned_pending"], ["Overdue", "overdue"], ["Contacted This Week", "contacted_this_week"], ["Converted", "converted_to_member"]].map(([label, key]) => <div className="card" key={key}><p className="eyebrow">{label}</p><h2>{Number(summary[key] || 0)}</h2></div>)}
      </div>
      <div className="portal-grid" style={{ marginTop: 16, gridTemplateColumns: "1fr 1fr" }}>
        <section className="card"><h3>By Status</h3><table className="report-table"><tbody>{byStatus.map((row) => <tr key={row.status}><td>{row.status}</td><td>{row.count}</td></tr>)}</tbody></table></section>
        <section className="card"><h3>Overdue Follow-ups</h3><table className="report-table"><thead><tr><th>Name</th><th>Due</th><th>Status</th><th>Contact</th></tr></thead><tbody>{overdue.length === 0 ? <tr><td colSpan="4">No overdue follow-ups.</td></tr> : overdue.map((row) => <tr key={row.id}><td>{row.full_name}</td><td>{row.due_date}</td><td>{row.status}</td><td>{row.phone || row.email || "—"}</td></tr>)}</tbody></table></section>
      </div>
    </section>
  );
}
