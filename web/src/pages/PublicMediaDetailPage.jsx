import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function fmtDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
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

function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(String(url || "").toLowerCase());
}

function toYouTubeEmbed(url) {
  const u = String(url || "");
  try {
    const parsed = new URL(u);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function PublicMediaDetailPage({ user }) {
  const params = useParams();
  const mediaId = params.id;
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mediaId) return;
    setStatus("");
    apiFetch(`/media-items/${mediaId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [mediaId]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(clamp(pct, 0, 100));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const title = item?.title || "Media";
  const heroImg =
    item?.thumbnail_url ||
    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1800";

  const durationLabel = fmtDuration(item?.duration_seconds);
  const dateLabel = fmtDate(item?.event_date || item?.published_at);

  const embedUrl = useMemo(() => {
    if (!item?.source_url) return null;
    if (!isYouTube(item.source_url)) return null;
    return toYouTubeEmbed(item.source_url);
  }, [item]);

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-primary text-white p-2 rounded-lg size-10 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="DLCF" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Deeper Life Campus Fellowship</h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">South West Zone • Media</p>
              </div>
            </Link>

            <Link
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              to="/media"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Media
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {item?.source_url ? (
              <a
                className="bg-primary hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all"
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
              >
                Open Media
              </a>
            ) : null}
            <Link className="bg-primary/10 text-primary px-5 py-2 rounded-lg text-sm font-bold transition-all" to="/portal">
              {user ? "Portal" : "Sign In"}
            </Link>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-[3px]">
          <div className="h-[3px] bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img alt={title} className="w-full h-full object-cover" src={heroImg} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-20 py-16">
          <nav className="flex items-center gap-2 text-sm text-white/75 mb-6">
            <Link className="hover:text-white" to="/">
              Home
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link className="hover:text-white" to="/media">
              Media Library
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white font-medium">{item?.media_type || "Media"}</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-4 w-fit">
              {item?.media_type || "Media"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{title}</h2>
            {item?.description ? (
              <p className="text-white/80 mb-6 leading-relaxed text-lg">{item.description}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
              {item?.speaker ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/80 text-sm">person</span>
                  <span>{item.speaker}</span>
                </div>
              ) : null}
              {dateLabel ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/80 text-sm">calendar_today</span>
                  <span>{dateLabel}</span>
                </div>
              ) : null}
              {durationLabel ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/80 text-sm">schedule</span>
                  <span>{durationLabel}</span>
                </div>
              ) : null}
              {item?.series ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/80 text-sm">label</span>
                  <span>{item.series}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                className="bg-primary text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                to="/media"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                Back
              </Link>
              <button
                type="button"
                className="p-3 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    await navigator.share({ title, url });
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

      {/* Player */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-20 py-10">
        {status ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{status}</div>
        ) : null}

        {!item ? (
          <p className="text-slate-600">Loading media details…</p>
        ) : embedUrl ? (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video">
            <iframe
              title={title}
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : item.source_url ? (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            {item.media_type === "audio" ? (
              <audio controls src={item.source_url} style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            ) : (
              <video controls src={item.source_url} style={{ width: "100%" }}>
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            No media source URL.
          </div>
        )}
      </section>
    </div>
  );
}
