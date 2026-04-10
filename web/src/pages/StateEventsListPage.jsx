import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import StatePublicHeader from "../components/StatePublicHeader";
import PublicFooter from "../components/PublicFooter";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeImageUrl = (value, fallback = "") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/")) {
    const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
    return `https://api.dlcfsw.org.ng${cleaned}`;
  }
  if (raw.startsWith("/")) return raw;
  return raw;
};

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const excerpt = (value, max = 140) => {
  const clean = stripHtml(value);
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
};

const formatEventDate = (startDate, endDate) => {
  const start = String(startDate || "").trim();
  const end = String(endDate || "").trim();
  if (!start && !end) return "Date to be announced";
  const formatOne = (value) => {
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };
  if (start && end && start !== end) return `${formatOne(start)} - ${formatOne(end)}`;
  return formatOne(start || end);
};

export default function StateEventsListPage({ stateSlug, states }) {
  const location = useLocation();
  const params = useParams();
  const segments = location.pathname.split("/").filter(Boolean);
  const resolvedStateSlug = stateSlug || params.stateId || segments[0] || "";
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");

  const stateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      if (typeof state === "string") return slugifyState(state) === resolvedStateSlug;
      return slugifyState(state?.slug || state?.name || "") === resolvedStateSlug;
    });
    return typeof match === "string" ? match : match?.name || null;
  }, [resolvedStateSlug, states]);

  useEffect(() => {
    if (!resolvedStateSlug) return;
    setStatus("");
    apiFetch(`/public/state-events.php?slug=${encodeURIComponent(resolvedStateSlug)}`)
      .then((data) => setEvents(Array.isArray(data.items) ? data.items : []))
      .catch((err) => setStatus(err.message));
  }, [resolvedStateSlug]);

  const displayName = stateName || resolvedStateSlug.replace(/-/g, " ");

  return (
    <div className="premium-state-page state-home-reference">
      <StatePublicHeader stateName={displayName} stateSlug={resolvedStateSlug} />
      <main className="state-reference-main">
        <section className="state-ref-hero state-ref-hero--compact">
          <div className="container state-ref-hero__grid">
            <div className="state-ref-hero__copy">
              <span className="state-ref-badge">Events</span>
              <h1>All Events in {displayName}</h1>
              <p>See upcoming programmes, revival meetings, Bible studies, and state gatherings.</p>
            </div>
          </div>
        </section>

        <section className="state-ref-section state-ref-section--white">
          <div className="container">
            {status ? <p>{status}</p> : null}
            <div className="state-ref-eventGrid">
              {(events.length ? events : []).map((event) => (
                <article key={event.id || event.slug} className="state-ref-eventCard">
                  <div className="state-ref-eventCard__image">
                    <img
                      src={normalizeImageUrl(event.feature_image_url || "", "https://placehold.co/800x500?text=Event")}
                      alt={event.title || "Event"}
                    />
                    <div className="state-ref-eventDate">{formatEventDate(event.event_start_date, event.event_end_date)}</div>
                  </div>
                  <div className="state-ref-eventCard__body">
                    <h3>{event.title}</h3>
                    <div className="state-ref-eventMeta" style={{ flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                      <span>{event.event_time_label || "Time TBA"}</span>
                      <span>{event.event_location || "Location TBA"}</span>
                      <span>{event.type || "Programme"}</span>
                    </div>
                    <p>{excerpt(event.content || "", 120)}</p>
                    <Link to={`/${resolvedStateSlug}/events/${event.slug || event.id}`}>View Details</Link>
                  </div>
                </article>
              ))}
            </div>
            {!status && events.length === 0 ? (
              <div className="state-ref-communityHint">No events available yet for this state.</div>
            ) : null}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
