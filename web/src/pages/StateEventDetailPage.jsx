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

const formatEventDate = (startDate, endDate) => {
  const start = String(startDate || "").trim();
  const end = String(endDate || "").trim();
  if (!start && !end) return "Date to be announced";
  const formatOne = (value) => {
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };
  if (start && end && start !== end) return `${formatOne(start)} - ${formatOne(end)}`;
  return formatOne(start || end);
};

export default function StateEventDetailPage({ stateSlug, eventSlug, states }) {
  const location = useLocation();
  const params = useParams();
  const segments = location.pathname.split("/").filter(Boolean);
  const resolvedStateSlug = stateSlug || params.stateId || segments[0] || "";
  const resolvedEventSlug = eventSlug || params.eventSlug || segments[2] || "";
  const [event, setEvent] = useState(null);
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
    if (!resolvedStateSlug || !resolvedEventSlug) return;
    setStatus("");
    apiFetch(`/public/state-event-detail.php?slug=${encodeURIComponent(resolvedStateSlug)}&event=${encodeURIComponent(resolvedEventSlug)}`)
      .then((data) => setEvent(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [resolvedStateSlug, resolvedEventSlug]);

  const displayName = stateName || resolvedStateSlug.replace(/-/g, " ");
  const heroImage = normalizeImageUrl(event?.feature_image_url || "", "/hero-image.jpg");

  return (
    <div className="premium-state-page state-home-reference">
      <StatePublicHeader stateName={displayName} stateSlug={resolvedStateSlug} />
      <main className="state-reference-main">
        <section
          className="state-ref-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(8, 20, 26, 0.78), rgba(16, 30, 40, 0.78)), url('${heroImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container state-ref-hero__grid">
            <div className="state-ref-hero__copy">
              <span className="state-ref-badge">Event Details</span>
              <h1>{event?.title || "Loading event..."}</h1>
              <p>{formatEventDate(event?.event_start_date, event?.event_end_date)}</p>
            </div>
          </div>
        </section>

        <section className="state-ref-section state-ref-section--white">
          <div className="container" style={{ maxWidth: 980 }}>
            <Link to={`/${resolvedStateSlug}/events`} className="state-ref-moreLink">← Back to All Events</Link>
            {status ? (
              <p>{status}</p>
            ) : !event ? (
              <p>Loading event...</p>
            ) : (
              <>
                <div className="state-ref-eventMeta" style={{ margin: "20px 0", flexWrap: "wrap", gap: "12px" }}>
                  <span>{formatEventDate(event.event_start_date, event.event_end_date)}</span>
                  <span>{event.event_time_label || "Time TBA"}</span>
                  <span>{event.event_location || "Location TBA"}</span>
                  <span>{event.type || "Programme"}</span>
                </div>
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: event.content || "<p>No event description available yet.</p>" }}
                />

                {Array.isArray(event.related_events) && event.related_events.length > 0 ? (
                  <div style={{ marginTop: 48 }}>
                    <h3 style={{ marginBottom: 20 }}>Other Events</h3>
                    <div className="state-ref-eventGrid">
                      {event.related_events.map((item) => (
                        <article key={item.id || item.slug} className="state-ref-eventCard">
                          <div className="state-ref-eventCard__image">
                            <img src={normalizeImageUrl(item.feature_image_url || "", "https://placehold.co/800x500?text=Event")} alt={item.title} />
                            <div className="state-ref-eventDate">{formatEventDate(item.event_start_date, item.event_end_date)}</div>
                          </div>
                          <div className="state-ref-eventCard__body">
                            <h3>{item.title}</h3>
                            <div className="state-ref-eventMeta">
                              <span>{item.event_time_label || "Time TBA"}</span>
                              <span>{item.type || "Programme"}</span>
                            </div>
                            <Link to={`/${resolvedStateSlug}/events/${item.slug || item.id}`}>View Details</Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
