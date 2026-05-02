import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";

const normalizeImageUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
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
  if (!start && !end) return "Not set";
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
const formatEventDisplayDate = (item) => item?.recurrence_mode === "weekly" ? `${recurringDayLabel(item?.recurrence_day_of_week)} (Weekly)` : formatEventDate(item?.event_start_date, item?.event_end_date);

export default function ZonalEventDetailPage({ user, eventId: eventIdProp }) {
  const params = useParams();
  const eventId = eventIdProp || params.id;
  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!eventId) return;
    setStatus("");
    apiFetch(`/public/zonal-event-detail.php?id=${encodeURIComponent(eventId)}`)
      .then((data) => setEvent(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [eventId]);

  const relatedEvents = useMemo(() => Array.isArray(event?.related_events) ? event.related_events : [], [event]);
  const heroImage = normalizeImageUrl(event?.feature_image_url || "");

  return <div className="bg-[#071019] text-[#191c1e]">
    <PublicNav user={user} />
    <main>
      <header className="relative min-h-[870px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImage ? <img alt={event?.title || "Event background"} className="w-full h-full object-cover brightness-[0.4]" src={heroImage} /> : <div className="w-full h-full bg-[#071019]" />}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071019]/85 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center space-x-2 bg-[#d8b169] text-[#09121c] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span><span>{event?.type || "Event"}</span></div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-[-0.02em] mb-6 leading-[0.9]">{event?.title || "Loading event..."}</h1>
            {event?.content ? <p className="text-xl text-slate-200 max-w-2xl font-light leading-relaxed mb-10">{excerpt(event.content, 200)}</p> : null}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10"><span className="material-symbols-outlined text-[#f2bf50] mr-4">calendar_today</span><div><p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Date</p><p className="text-white font-medium">{formatEventDisplayDate(event)}</p></div></div>
              <div className="flex items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10"><span className="material-symbols-outlined text-[#f2bf50] mr-4">location_on</span><div><p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Location</p><p className="text-white font-medium">{event?.event_location || "Not set"}</p></div></div>
            </div>
          </div>
        </div>
      </header>

      {status ? <p className="max-w-7xl mx-auto px-8 pt-10 text-[#d8b169]">{status}</p> : null}
      <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 zonal-detail-metal-section relative z-0 text-[#f6efe2]">
        <div className="lg:col-span-7 space-y-20">
          <div>
            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap"><h2 className="text-4xl font-black text-white tracking-tight">Event Details</h2><Link to="/events" className="text-sm font-bold uppercase tracking-widest text-[#d8b169] hover:underline">Back to Events</Link></div>
            {event?.content ? <div className="prose prose-lg max-w-none prose-invert text-[#f6efe2]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.content }} /> : <p className="text-[#f6efe2]/75">No event description has been added yet.</p>}
          </div>

          <div>
            <h3 className="text-2xl font-black text-white mb-10 tracking-tight uppercase">Other Events</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {relatedEvents.length > 0 ? relatedEvents.map((item) => {
                const itemImage = normalizeImageUrl(item.feature_image_url || "");
                return <div key={item.id || item.slug} className="group">
                  {itemImage ? <div className="relative mb-4 overflow-hidden rounded-2xl"><img alt={item.title} className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-110" src={itemImage} /><div className="absolute inset-0 bg-[#071019]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div></div> : null}
                  <h4 className="text-xl font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-[#d8b169] font-medium uppercase tracking-widest mb-2">{item.type || "Event"}</p>
                  <p className="text-[#f6efe2]/70 text-sm leading-relaxed mb-3">{formatEventDisplayDate(item)}</p>
                  <Link to={`/events/${item.slug || item.id}`} className="text-sm font-bold uppercase tracking-widest text-[#d8b169] hover:underline">View Details</Link>
                </div>;
              }) : <p className="text-[#f6efe2]/75">No related events yet.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5"><div className="sticky top-32 space-y-8"><div className="zonal-metal-panel p-10 rounded-3xl"><h3 className="text-2xl font-black text-white mb-2">Event Snapshot</h3><p className="text-[#f6efe2]/70 mb-8">Details from the published event record.</p><div className="space-y-4 mb-8"><div className="flex items-center justify-between py-3 border-b border-white/10 gap-4"><span className="text-sm font-medium text-[#f6efe2]/55">Event Type</span><span className="text-[#f6efe2] font-bold text-right">{event?.type || "Not set"}</span></div><div className="flex items-center justify-between py-3 border-b border-white/10 gap-4"><span className="text-sm font-medium text-[#f6efe2]/55">Date</span><span className="text-[#f6efe2] font-bold text-right">{formatEventDisplayDate(event)}</span></div><div className="flex items-center justify-between py-3 border-b border-white/10 gap-4"><span className="text-sm font-medium text-[#f6efe2]/55">Time</span><span className="text-[#f6efe2] font-bold text-right">{event?.event_time_label || "Not set"}</span></div><div className="flex items-center justify-between py-3 gap-4"><span className="text-sm font-medium text-[#f6efe2]/55">Location</span><span className="text-[#f6efe2] font-bold text-right">{event?.event_location || "Not set"}</span></div></div><Link to="/events" className="block w-full bg-[#d8b169] text-[#09121c] py-5 rounded-xl text-center font-black uppercase tracking-widest text-sm hover:bg-[#f4d28b] transition-colors shadow-lg shadow-black/20">View All Events</Link></div></div></div>
      </section>
    </main>
    <PublicFooter />
  </div>;
}
