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
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/")) {
    const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
    return `https://api.dlcfsw.org.ng${cleaned}`;
  }
  if (raw.startsWith("/")) return raw;
  return raw;
};

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const excerpt = (value, max = 150) => {
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
const recurringDayLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Weekly";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};
const getDayMonth = (startDate, endDate) => {
  const value = String(startDate || endDate || "").trim();
  if (!value) return { day: "--", month: "TBA" };
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: value.slice(-2) || "--", month: value.slice(5, 7) || "TBA" };
  return { day: d.toLocaleDateString("en-NG", { day: "2-digit" }), month: d.toLocaleDateString("en-NG", { month: "short" }) };
};
const getEventBadgeDate = (event) => event?.recurrence_mode === "weekly"
  ? { day: recurringDayLabel(event?.recurrence_day_of_week).slice(0, 3), month: "WKLY" }
  : getDayMonth(event?.event_start_date, event?.event_end_date);
const eventTypeLabel = (value) => String(value || "Programme").trim() || "Programme";

export default function ZonalEventsListPage({ user }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Events");
  const displayName = "DLCF South West";

  useEffect(() => {
    setStatus("");
    apiFetch("/public/zonal-events.php")
      .then((data) => setEvents(Array.isArray(data.items) ? data.items : []))
      .catch((err) => { setStatus(err.message); setEvents([]); });
  }, []);

  const filterOptions = useMemo(() => {
    const types = Array.from(new Set(events.map((item) => eventTypeLabel(item.type)).filter(Boolean)));
    return ["All Events", ...types.slice(0, 4)];
  }, [events]);
  const filteredEvents = useMemo(() => activeFilter === "All Events" ? events : events.filter((item) => eventTypeLabel(item.type) === activeFilter), [activeFilter, events]);
  const featuredEvent = filteredEvents[0] || null;
  const sideEvents = filteredEvents.slice(1, 3);
  const wideEvent = filteredEvents[3] || null;
  const remainingEvents = filteredEvents.slice(4);

  const EventButton = ({ to, dark = false }) => (
    <Link to={to} className={`mt-auto inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest transition-all duration-300 ${dark ? "bg-white text-primary hover:bg-[#f2bf50] hover:text-[#261900]" : "border border-primary/10 text-primary hover:bg-primary hover:text-white"}`}>
      View Details
      <span className="material-symbols-outlined text-base">arrow_forward</span>
    </Link>
  );

  return <div className="bg-[#002659] text-[#191c1e]">
    <PublicNav user={user} />
    <main>
      <section className="relative min-h-[614px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover brightness-[0.4]" src={normalizeImageUrl(featuredEvent?.feature_image_url || "", "https://placehold.co/1600x900?text=Zone+Events")} alt="DLCF South West events" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#002659]/70 to-[#002659]"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <span className="inline-block uppercase tracking-[0.3em] text-[#f2bf50] mb-4 text-sm font-semibold">Our Community Gatherings</span>
          <h1 className="font-black text-6xl md:text-8xl text-white tracking-tighter mb-8 leading-[0.9]">Zone <br /><span className="text-[#ffdea1]">Events</span></h1>
          <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">Experience moments of spiritual renewal, growth, and fellowship across {displayName}.</p>
        </div>
      </section>

      <section className="px-8 max-w-7xl mx-auto -mt-16 relative z-0 pb-20">
        <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-[#002659]/5 flex flex-wrap items-center justify-center gap-4 mb-20 border border-[#c4c6d2]/20">
          {filterOptions.map((option) => {
            const active = option === activeFilter;
            return <button key={option} type="button" onClick={() => setActiveFilter(option)} className={active ? "bg-[#002659] text-white uppercase tracking-widest text-xs px-8 py-4 rounded-xl font-bold" : "text-[#434750] hover:bg-[#e6e8eb] uppercase tracking-widest text-xs px-8 py-4 rounded-xl font-bold transition-all duration-300"}>{option}</button>;
          })}
        </div>

        {status ? <p className="mb-10 text-center text-red-600">{status}</p> : null}
        {!status && filteredEvents.length === 0 ? <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-[#c4c6d2]/20"><h3 className="text-3xl font-black text-[#002659] mb-4">No events yet</h3><p className="text-[#434750]">Upcoming zone-wide programmes will appear here once they are published.</p></div> : <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {featuredEvent ? (() => { const dm = getEventBadgeDate(featuredEvent); return <div className="md:col-span-8 group"><div className="bg-white rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-[#002659]/10"><div className="relative h-[400px] overflow-hidden"><img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={normalizeImageUrl(featuredEvent.feature_image_url || "", "https://placehold.co/1200x700?text=Featured+Event")} alt={featuredEvent.title || "Featured event"} /><div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl text-center min-w-[70px]"><span className="block text-2xl font-black text-[#002659] leading-none">{dm.day}</span><span className="block text-[10px] font-bold uppercase tracking-widest text-[#513a00] mt-1">{dm.month}</span></div></div><div className="p-10 flex-grow flex flex-col"><div className="flex items-center gap-4 mb-6 flex-wrap"><span className="bg-[#ffdea1] text-[#261900] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{eventTypeLabel(featuredEvent.type)}</span><div className="flex items-center text-[#434750] gap-2 text-sm font-medium"><span className="material-symbols-outlined text-base">schedule</span>{featuredEvent.recurrence_mode === "weekly" ? `${recurringDayLabel(featuredEvent.recurrence_day_of_week)} · ${featuredEvent.event_time_label || "Time TBA"}` : featuredEvent.event_time_label || "Time TBA"}</div></div><h3 className="font-black text-4xl text-[#002659] tracking-tight mb-4 leading-tight">{featuredEvent.title}</h3><p className="text-[#434750] leading-relaxed text-lg mb-8 max-w-2xl">{excerpt(featuredEvent.content || "", 180)}</p><div className="mt-auto flex items-center justify-between border-t border-[#e0e3e6] pt-8 gap-6 flex-wrap"><div className="flex items-center gap-3"><div className="bg-[#d8e2ff] w-10 h-10 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[#002659] text-xl">location_on</span></div><span className="text-sm font-bold text-[#002659]">{featuredEvent.event_location || "Location TBA"}</span></div><EventButton to={`/events/${featuredEvent.slug || featuredEvent.id}`} /></div></div></div></div>; })() : null}
            {sideEvents.map((event) => { const dm = getEventBadgeDate(event); return <div key={event.id || event.slug} className="md:col-span-4 group"><div className="bg-white rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-[#002659]/10"><div className="relative h-[250px] overflow-hidden"><img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={normalizeImageUrl(event.feature_image_url || "", "https://placehold.co/800x500?text=Event")} alt={event.title || "Event"} /><div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl text-center min-w-[60px]"><span className="block text-xl font-black text-[#002659] leading-none">{dm.day}</span><span className="block text-[8px] font-bold uppercase tracking-widest text-[#513a00] mt-0.5">{dm.month}</span></div></div><div className="p-8 flex-grow flex flex-col"><span className="bg-[#b3c9fd] text-[#304672] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">{eventTypeLabel(event.type)}</span><h3 className="font-bold text-2xl text-[#002659] tracking-tight mb-4 leading-tight">{event.title}</h3><div className="flex flex-col gap-3 text-[#434750] text-sm mb-6"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">schedule</span>{event.recurrence_mode === "weekly" ? `${recurringDayLabel(event.recurrence_day_of_week)} · ${event.event_time_label || "Time TBA"}` : event.event_time_label || formatEventDate(event.event_start_date, event.event_end_date)}</div><div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span>{event.event_location || "Location TBA"}</div></div><EventButton to={`/events/${event.slug || event.id}`} /></div></div></div>; })}
            {wideEvent ? (() => { const dm = getEventBadgeDate(wideEvent); return <div className="md:col-span-8 group"><div className="bg-[#002659] text-white rounded-3xl overflow-hidden h-full flex flex-col md:flex-row transition-all duration-500 hover:shadow-2xl hover:shadow-[#002659]/20"><div className="md:w-2/5 relative overflow-hidden"><img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" src={normalizeImageUrl(wideEvent.feature_image_url || "", "https://placehold.co/900x700?text=Special+Event")} alt={wideEvent.title || "Special event"} /></div><div className="md:w-3/5 p-10 flex flex-col"><div className="flex justify-between items-start mb-6 gap-4"><span className="text-[#ffdea1] text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-[#ffdea1] pb-1">Special Event</span><div className="text-right"><span className="block text-3xl font-black leading-none">{dm.day}</span><span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">{dm.month}</span></div></div><h3 className="font-black text-3xl tracking-tight mb-4 leading-tight">{wideEvent.title}</h3><p className="text-white/70 leading-relaxed mb-8">{excerpt(wideEvent.content || "", 140)}</p><div className="mt-auto flex flex-col sm:flex-row items-center gap-6"><div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[#ffdea1]">hotel_class</span>{eventTypeLabel(wideEvent.type)}</div><div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[#ffdea1]">location_on</span>{wideEvent.event_location || "Location TBA"}</div><div className="sm:ml-auto"><EventButton to={`/events/${wideEvent.slug || wideEvent.id}`} dark /></div></div></div></div></div>; })() : null}
          </div>
          {remainingEvents.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">{remainingEvents.map((event) => { const dm = getEventBadgeDate(event); return <div key={event.id || event.slug} className="group"><div className="bg-white rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-[#002659]/10"><div className="relative h-[250px] overflow-hidden"><img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={normalizeImageUrl(event.feature_image_url || "", "https://placehold.co/800x500?text=Event")} alt={event.title || "Event"} /><div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl text-center min-w-[60px]"><span className="block text-xl font-black text-[#002659] leading-none">{dm.day}</span><span className="block text-[8px] font-bold uppercase tracking-widest text-[#513a00] mt-0.5">{dm.month}</span></div></div><div className="p-8 flex-grow flex flex-col"><span className="bg-[#eceef1] text-[#304672] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">{eventTypeLabel(event.type)}</span><h3 className="font-bold text-2xl text-[#002659] tracking-tight mb-4 leading-tight">{event.title}</h3><p className="text-[#434750] text-sm leading-relaxed mb-5">{excerpt(event.content || "", 110)}</p><div className="flex flex-col gap-3 text-[#434750] text-sm mb-6"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">schedule</span>{event.recurrence_mode === "weekly" ? `${recurringDayLabel(event.recurrence_day_of_week)} · ${event.event_time_label || "Time TBA"}` : event.event_time_label || formatEventDate(event.event_start_date, event.event_end_date)}</div><div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span>{event.event_location || "Location TBA"}</div></div><EventButton to={`/events/${event.slug || event.id}`} /></div></div></div>; })}</div> : null}
        </>}
      </section>

      <section className="py-24 bg-[#002659] overflow-hidden relative border-t border-white/10">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-5 pointer-events-none"><span className="material-symbols-outlined text-[30rem] leading-none translate-x-20">event_note</span></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl"><h2 className="font-black text-5xl text-white tracking-tighter mb-6">Stay Connected to the Word</h2><p className="text-white/75 text-lg leading-relaxed">Never miss a gathering. Stay connected with upcoming programmes, special sessions, and fellowship moments across {displayName}.</p></div>
          <Link to="/contact" className="bg-[#ffdea1] text-[#261900] font-extrabold uppercase tracking-widest text-xs px-10 py-5 rounded-lg shadow-xl shadow-black/20 hover:-translate-y-1 transition-all">Contact Us</Link>
        </div>
      </section>
    </main>
    <PublicFooter />
  </div>;
}
