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
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };
  if (start && end && start !== end) return `${formatOne(start)} - ${formatOne(end)}`;
  return formatOne(start || end);
};

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const excerpt = (value, max = 160) => {
  const clean = stripHtml(value);
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
};

const recurringDayLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Weekly";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
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
  const heroImage = normalizeImageUrl(event?.feature_image_url || "", "https://placehold.co/1600x1000?text=Event");
  const locationImage = normalizeImageUrl(event?.feature_image_url || "", "https://placehold.co/1200x900?text=Venue");

  return (
    <div className="bg-[#f7f9fc] text-[#191c1e]">
      <StatePublicHeader stateName={displayName} stateSlug={resolvedStateSlug} />

      <main>
        <header className="relative min-h-[870px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img alt="Event background" className="w-full h-full object-cover brightness-[0.4]" src={heroImage} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#002659]/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center space-x-2 bg-[#ffdea1] text-[#261900] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span>{event?.type || "Flagship Ministry Event"}</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.02em] mb-6 leading-[0.9]">
                {event?.title || "Loading event..."}
              </h1>
              <p className="text-xl text-slate-200 max-w-2xl font-light leading-relaxed mb-10">
                {excerpt(event?.content || "A gathering for spiritual renewal, biblical insight, and fellowship.", 200)}
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                  <span className="material-symbols-outlined text-[#f2bf50] mr-4">calendar_today</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Date</p>
                    <p className="text-white font-medium">
                      {event?.recurrence_mode === "weekly"
                        ? `${recurringDayLabel(event?.recurrence_day_of_week)} (Weekly)`
                        : formatEventDate(event?.event_start_date, event?.event_end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                  <span className="material-symbols-outlined text-[#f2bf50] mr-4">location_on</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Location</p>
                    <p className="text-white font-medium">{event?.event_location || "Location TBA"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-20">
            <div>
              <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                <h2 className="text-4xl font-black text-[#002659] tracking-tight">The Vision of this Event</h2>
                <Link to={`/${resolvedStateSlug}/events`} className="text-sm font-bold uppercase tracking-widest text-[#002659] hover:underline">
                  Back to Events
                </Link>
              </div>
              <div
                className="prose prose-lg max-w-none text-[#434750] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: event?.content || "<p>No event description available yet.</p>" }}
              />
              <div className="mt-12 p-8 bg-[#f2f4f7] rounded-2xl border-l-4 border-[#002659]">
                <p className="italic text-[#002659] font-medium text-lg leading-relaxed">
                  This gathering is designed to strengthen faith, deepen conviction, and build meaningful fellowship across the state.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#002659] mb-10 tracking-tight uppercase">Other Events</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {Array.isArray(event?.related_events) && event.related_events.length > 0 ? (
                  event.related_events.map((item) => (
                    <div key={item.id || item.slug} className="group">
                      <div className="relative mb-4 overflow-hidden rounded-2xl">
                        <img alt={item.title} className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-110" src={normalizeImageUrl(item.feature_image_url || "", "https://placehold.co/800x1000?text=Event")} />
                        <div className="absolute inset-0 bg-[#002659]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <h4 className="text-xl font-bold text-[#002659]">{item.title}</h4>
                      <p className="text-sm text-[#485e8c] font-medium uppercase tracking-widest mb-2">{item.type || "Programme"}</p>
                      <p className="text-[#434750] text-sm leading-relaxed mb-3">{formatEventDate(item.event_start_date, item.event_end_date)}</p>
                      <Link to={`/${resolvedStateSlug}/events/${item.slug || item.id}`} className="text-sm font-bold uppercase tracking-widest text-[#002659] hover:underline">
                        View Details
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-[#434750]">No related events yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-[#002659]/5 border border-[#eceef1]">
                <h3 className="text-2xl font-black text-[#002659] mb-2">Event Snapshot</h3>
                <p className="text-[#434750] mb-8">Quick details for attendees and state members.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-[#e0e3e6] gap-4">
                    <span className="text-sm font-medium text-slate-500">Event Type</span>
                    <span className="text-[#002659] font-bold text-right">{event?.type || "Programme"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#e0e3e6] gap-4">
                    <span className="text-sm font-medium text-slate-500">Time</span>
                    <span className="text-[#002659] font-bold text-right">{event?.event_time_label || "Time TBA"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 gap-4">
                    <span className="text-sm font-medium text-slate-500">Location</span>
                    <span className="text-[#002659] font-bold text-right">{event?.event_location || "Location TBA"}</span>
                  </div>
                </div>
                <Link to={`/${resolvedStateSlug}/events`} className="block w-full bg-[#002659] text-white py-5 rounded-xl text-center font-black uppercase tracking-widest text-sm hover:bg-[#123c7a] transition-colors shadow-lg shadow-[#002659]/20">
                  View All Events
                </Link>
                <p className="text-center text-[10px] uppercase tracking-tighter text-slate-400 mt-4 font-bold">Stay connected with upcoming gatherings</p>
              </div>

              <div className="bg-[#f2f4f7] p-10 rounded-3xl">
                <h3 className="text-xl font-black text-[#002659] mb-8 tracking-tight uppercase">The Agenda</h3>
                <div className="space-y-8">
                  <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:rounded-full before:bg-[#f2bf50]">
                    <p className="text-[10px] font-black text-[#485e8c] tracking-widest uppercase mb-1">Event Schedule</p>
                    <p className="text-lg font-bold text-[#002659] mb-1">Arrival and Fellowship</p>
                    <p className="text-sm text-[#434750]">Participants gather, connect, and prepare for the programme.</p>
                  </div>
                  <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:rounded-full before:bg-[#002659]">
                    <p className="text-[10px] font-black text-[#485e8c] tracking-widest uppercase mb-1">Main Session</p>
                    <p className="text-lg font-bold text-[#002659] mb-1">Teaching, Worship, and Prayer</p>
                    <p className="text-sm text-[#434750]">Core event moments focused on biblical growth and fellowship.</p>
                  </div>
                  <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:rounded-full before:bg-[#002659]">
                    <p className="text-[10px] font-black text-[#485e8c] tracking-widest uppercase mb-1">Closing</p>
                    <p className="text-lg font-bold text-[#002659] mb-1">Charge and Blessing</p>
                    <p className="text-sm text-[#434750]">A closing moment of prayer, announcements, and next steps.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[500px]">
            <div className="md:col-span-8 relative rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-[#002659]/40 group-hover:bg-[#002659]/20 transition-all z-10"></div>
              <img alt="Venue" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={locationImage} />
              <div className="absolute bottom-10 left-10 z-20 text-white">
                <h4 className="text-3xl font-black mb-2">The Sanctuary</h4>
                <p className="text-white/80 max-w-md">{event?.event_location || `Our venue for this event in ${displayName}.`}</p>
              </div>
            </div>
            <div className="md:col-span-4 bg-[#002659] p-10 rounded-3xl flex flex-col justify-between text-white">
              <div>
                <span className="material-symbols-outlined text-4xl text-[#ffdea1] mb-6">map</span>
                <h4 className="text-2xl font-bold mb-4">How to Get Here</h4>
                <p className="text-blue-200 text-sm leading-relaxed mb-6">The event location is prepared to receive worshippers, guests, and participants from across the state.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="material-symbols-outlined text-[#ffdea1] text-lg">event</span>
                  <span>
                    {event?.recurrence_mode === "weekly"
                      ? `${recurringDayLabel(event?.recurrence_day_of_week)} (Weekly)`
                      : formatEventDate(event?.event_start_date, event?.event_end_date)}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="material-symbols-outlined text-[#ffdea1] text-lg">schedule</span>
                  <span>{event?.event_time_label || "Time TBA"}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="material-symbols-outlined text-[#ffdea1] text-lg">location_on</span>
                  <span>{event?.event_location || "Location TBA"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
