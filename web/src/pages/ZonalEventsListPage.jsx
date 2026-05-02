import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";

const normalizeImageUrl = (value, fallback = "") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/")) return `https://api.dlcfsw.org.ng${raw.startsWith("/") ? raw : `/${raw}`}`;
  return raw;
};
const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export default function ZonalEventsListPage({ user }) {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    setStatus("");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    apiFetch(`/public/zonal-events.php?${params.toString()}`)
      .then((data) => setEvents(Array.isArray(data.items) ? data.items : []))
      .catch((err) => { setStatus(err.message); setEvents([]); });
  }, []);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return events;
    return events.filter((item) => `${item.title || ""} ${item.type || ""} ${stripHtml(item.content || "")} ${item.event_location || ""}`.toLowerCase().includes(needle));
  }, [events, q]);
  return <div className="public-home zonal-events-page">
    <PublicNav user={user} />
    <section className="public-section publications-list-head gospel-library-head">
      <div>
        <p className="section-kicker">DLCF South West</p>
        <h2>Zone-wide Events</h2>
        <p className="lede">Search and browse programmes, congresses, revivals, retreats, and announcements for the whole zone.</p>
      </div>
      <div className="media-library-controls"><input placeholder="Search zone events" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    </section>
    <section className="public-section media-library-grid publications-grid-premium gospel-publications-grid">
      {status ? <p className="homepage-dashboard__empty">{status}</p> : null}
      {filtered.map((event) => <Link key={event.id} to={`/events/${event.slug || event.id}`} className="media-item-card gospel-publication-card">
        {event.feature_image_url ? <img className="media-thumb" src={normalizeImageUrl(event.feature_image_url)} alt={event.title} /> : <div className="media-thumb" />}
        <div className="media-item-header"><span className="media-pill">{event.type || "Event"}</span><span className="media-pill subtle">Zone-wide</span></div>
        <h3>{event.title}</h3>
        <p>{stripHtml(event.content).slice(0, 120)}{stripHtml(event.content).length > 120 ? "…" : ""}</p>
        <p className="media-item-meta"><span>{event.recurrence_mode === "weekly" ? `Weekly · ${event.recurrence_day_of_week || "Day TBA"}` : formatDate(event.event_start_date)}</span><span>{event.event_location || "DLCF South West"}</span></p>
      </Link>)}
      {filtered.length === 0 && !status ? <p className="homepage-dashboard__empty">No zone-wide events found.</p> : null}
    </section>
    <PublicFooter />
  </div>;
}
