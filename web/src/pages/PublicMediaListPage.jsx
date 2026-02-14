import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

function fmtDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fmtDuration(seconds) {
  const s = Number(seconds || 0);
  if (!Number.isFinite(s) || s <= 0) return null;
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export default function PublicMediaListPage({ user }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  const [tab, setTab] = useState("video"); // video | audio | photo
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState("All");
  const [series, setSeries] = useState("All");

  useEffect(() => {
    setStatus("");
    apiFetch("/media-items?scope=zonal")
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));
  }, []);

  const speakers = useMemo(() => {
    const s = new Set();
    for (const i of items) if (i.speaker) s.add(i.speaker);
    return ["All", ...Array.from(s).sort()];
  }, [items]);

  const seriesList = useMemo(() => {
    const s = new Set();
    for (const i of items) if (i.series) s.add(i.series);
    return ["All", ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    let base = items;

    // Map tab to media types
    if (tab === "video") base = base.filter((i) => i.media_type === "video");
    if (tab === "audio") base = base.filter((i) => i.media_type === "audio");
    if (tab === "photo") base = base.filter((i) => i.media_type === "photo" || i.media_type === "image");

    if (speaker !== "All") base = base.filter((i) => i.speaker === speaker);
    if (series !== "All") base = base.filter((i) => i.series === series);

    const q = query.trim().toLowerCase();
    if (q) {
      base = base.filter((i) => {
        const hay = `${i.title || ""} ${i.description || ""} ${i.speaker || ""} ${i.series || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return base;
  }, [items, tab, speaker, series, query]);

  const featured = useMemo(() => filtered[0] || null, [filtered]);

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <SEO title="Media Library" description="Watch and listen to zonal-wide messages and programs." />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <span className="material-symbols-outlined block">church</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Grace Media Hub</h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" to="/">
                Home
              </Link>
              <Link className="text-sm font-semibold text-primary" to="/media">
                Sermons
              </Link>
              <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/states">
                Directory
              </Link>
              <Link className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/publications">
                Gospel Library
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary"
                placeholder="Search sermons..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Link className="bg-primary hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/portal">
              {user ? "Portal" : "Sign In"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-20 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link className="hover:text-primary" to="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Media Library</span>
        </nav>

        {status ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{status}</div>
        ) : null}

        {/* Featured */}
        {featured ? (
          <section className="mb-12">
            <div className="grid lg:grid-cols-3 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Link
                to={`/media/${featured.id}`}
                className="lg:col-span-2 relative aspect-video bg-black flex items-center justify-center group cursor-pointer overflow-hidden"
              >
                <img
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                  src={
                    featured.thumbnail_url ||
                    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1400"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <button
                  type="button"
                  className="relative z-10 size-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                    play_arrow
                  </span>
                </button>
                {fmtDuration(featured.duration_seconds) ? (
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-bold">
                    {fmtDuration(featured.duration_seconds)}
                  </span>
                ) : null}
              </Link>

              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-4 w-fit">
                  Featured Sermon
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-4">{featured.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {featured.description || "Watch and listen to the latest messages and special programs."}
                </p>

                <div className="flex items-center gap-4 mb-8">
                  <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{featured.speaker || "Guest Minister"}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{featured.series || "Sermon"}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                    to={`/media/${featured.id}`}
                  >
                    <span className="material-symbols-outlined text-xl">play_circle</span>
                    Watch Now
                  </Link>
                  <button
                    type="button"
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={async () => {
                      const url = window.location.href;
                      if (navigator.share) {
                        await navigator.share({ title: featured.title, url });
                      } else {
                        await navigator.clipboard.writeText(url);
                        alert("Link copied");
                      }
                    }}
                  >
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex border-b border-slate-200 dark:border-slate-800 w-fit">
            <button
              type="button"
              className={`px-6 py-3 border-b-2 font-bold text-sm flex items-center gap-2 ${
                tab === "video" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-primary"
              }`}
              onClick={() => setTab("video")}
            >
              <span className="material-symbols-outlined text-xl">videocam</span> Videos
            </button>
            <button
              type="button"
              className={`px-6 py-3 border-b-2 font-bold text-sm flex items-center gap-2 ${
                tab === "audio" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-primary"
              }`}
              onClick={() => setTab("audio")}
            >
              <span className="material-symbols-outlined text-xl">mic</span> Audio
            </button>
            <button
              type="button"
              className={`px-6 py-3 border-b-2 font-bold text-sm flex items-center gap-2 ${
                tab === "photo" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-primary"
              }`}
              onClick={() => setTab("photo")}
            >
              <span className="material-symbols-outlined text-xl">photo_library</span> Photos
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative group">
              <span className="sr-only">Speaker</span>
              <select
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
              >
                {speakers.map((s) => (
                  <option key={s} value={s}>
                    Speaker: {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="relative group">
              <span className="sr-only">Series</span>
              <select
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
              >
                {seriesList.map((s) => (
                  <option key={s} value={s}>
                    Series: {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((i) => (
            <Link
              key={i.id}
              to={`/media/${i.id}`}
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img
                  alt={i.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={
                    i.thumbnail_url ||
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200"
                  }
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                    play_circle
                  </span>
                </div>
                {fmtDuration(i.duration_seconds) ? (
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-bold">
                    {fmtDuration(i.duration_seconds)}
                  </span>
                ) : null}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{i.series || "Sermon"}</p>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                  {i.title}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{i.speaker || ""}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{fmtDate(i.event_date) || ""}</p>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-10">
              No media items found.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
