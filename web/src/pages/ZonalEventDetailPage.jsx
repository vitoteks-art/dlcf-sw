import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

export default function ZonalEventDetailPage({ user, eventId: eventIdProp }) {
  const params = useParams();
  const eventId = eventIdProp || params.id;
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (!eventId) return;
    apiFetch(`/public/zonal-event-detail.php?id=${encodeURIComponent(eventId)}`)
      .then((data) => setEvent(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [eventId]);
  return <div className="public-home zonal-event-detail-page">
    <PublicNav user={user} />
    <section className="public-section article-detail-shell">
      <Link to="/events" className="text-sm font-bold uppercase tracking-widest text-[#d8b169] hover:underline">← Back to zone events</Link>
      {status ? <p className="homepage-dashboard__empty">{status}</p> : null}
      {event ? <article className="wp-publication-preview card">
        {event.feature_image_url ? <figure><img src={normalizeImageUrl(event.feature_image_url)} alt={event.title} /></figure> : null}
        <p className="publication-pill">{event.type || "Zone-wide Event"}</p>
        <h1>{event.title}</h1>
        <p className="muted">{event.recurrence_mode === "weekly" ? `Weekly · ${event.recurrence_day_of_week || "Day TBA"}` : formatDate(event.event_start_date)}{event.event_location ? ` • ${event.event_location}` : ""}</p>
        <div className="post-content preview-rich" dangerouslySetInnerHTML={{ __html: event.content || "" }} />
      </article> : !status ? <p className="homepage-dashboard__empty">Loading event…</p> : null}
    </section>
    <PublicFooter />
  </div>;
}
