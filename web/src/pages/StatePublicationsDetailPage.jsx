import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatePublicHeader from "../components/StatePublicHeader";
import { apiFetch } from "../api";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function StatePublicationsDetailPage({ stateSlug, states, publicationId: publicationIdProp }) {
  const params = useParams();
  const publicationId = publicationIdProp || params.id;
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const resolvedStateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      if (typeof state === "string") return slugifyState(state) === stateSlug;
      if (state?.slug) return slugifyState(state.slug) === stateSlug;
      if (state?.name) return slugifyState(state.name) === stateSlug;
      return false;
    });
    if (!match) return null;
    return typeof match === "string" ? match : match?.name || null;
  }, [stateSlug, states]);

  const displayName = useMemo(() => {
    const raw =
      resolvedStateName ||
      stateSlug.charAt(0).toUpperCase() + stateSlug.slice(1).replace("-", " ");

    const m = String(raw).trim().match(/^(.+?)\s+State\s+\((.+)\)$/i);
    if (m) return `${m[1]} (${m[2]}) State`;
    const m2 = String(raw).trim().match(/^(.+?)\s+State\s+(\d+)$/i);
    if (m2) return `${m2[1]} (${m2[2]}) State`;
    return raw;
  }, [resolvedStateName, stateSlug]);

  useEffect(() => {
    if (!publicationId) return;
    setStatus("");
    apiFetch(`/publication-items/${publicationId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [publicationId]);

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

  const title = item?.title || "Publication";
  const kicker = item?.publication_type || "Gospel Publications";
  const isFeatured = (item?.tags || "").toLowerCase().includes("featured");

  const readingMinutes = useMemo(() => {
    const html = item?.content_html || "";
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return null;
    const words = text.split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [item]);

  const publishedLabel = useMemo(() => {
    const raw = item?.publish_date || item?.published_at || item?.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }, [item]);

  const heroImg =
    item?.cover_image_url ||
    "https://images.unsplash.com/photo-1523803326055-9729b9e02e5f?auto=format&fit=crop&q=80&w=1800";
  const desc = (item?.description || "").trim();

  return (
    <div className="font-display bg-[#FDFBF7] text-slate-900 min-h-screen">
      {/* keep existing state header */}
      <StatePublicHeader stateName={displayName} stateSlug={stateSlug} />

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#FDFBF7]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            className="flex items-center gap-2 text-[#002147] hover:text-[#D4AF37] transition-colors font-semibold text-sm group"
            to={`/${stateSlug}/publications`}
          >
            <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            Back to Library
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D4AF37]">auto_stories</span>
              <span className="text-xs uppercase tracking-widest font-bold text-[#002147]">{kicker}</span>
            </div>
          </div>

          {item?.file_url ? (
            <a
              className="flex items-center gap-2 px-4 py-2 bg-[#002147] text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all"
              href={item.file_url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              PDF
            </a>
          ) : (
            <span className="text-xs text-slate-500">No PDF</span>
          )}
        </div>

        {/* reading progress */}
        <div className="w-full bg-slate-100 h-[3px]">
          <div className="h-[3px] bg-[#D4AF37]" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative h-[70vh] w-full overflow-hidden flex items-end">
          <div className="absolute inset-0">
            <img alt={title} className="w-full h-full object-cover" src={heroImg} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#002147] via-[#002147]/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 pb-16 md:pb-24 text-center">
            {isFeatured ? (
              <span className="inline-block px-4 py-1 rounded-full bg-[#D4AF37] text-[#002147] text-xs font-bold uppercase tracking-widest mb-6">
                Featured Study
              </span>
            ) : (
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
                {kicker}
              </span>
            )}

            <h1 className="serif-title text-4xl md:text-6xl lg:text-7xl text-white mb-8 leading-tight">{title}</h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm md:text-base">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full border-2 border-[#D4AF37]/50 p-0.5">
                  <div className="w-full h-full rounded-full bg-white/20" />
                </div>
                <span className="font-medium">DLCF Editorial</span>
              </div>

              {publishedLabel ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#D4AF37] text-sm">calendar_today</span>
                    {publishedLabel}
                  </div>
                </>
              ) : null}

              {readingMinutes ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#D4AF37] text-sm">schedule</span>
                    {readingMinutes} min read
                  </div>
                </>
              ) : null}
            </div>

            {desc ? (
              <p className="mt-10 text-white/85 text-lg md:text-xl max-w-3xl mx-auto serif-title">{desc}</p>
            ) : null}
          </div>
        </section>

        {/* Body */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
          {status ? (
            <div className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{status}</div>
          ) : null}

          {!item ? (
            <p className="text-slate-600">Loading publication details…</p>
          ) : (
            <>
              <article className="article-body max-w-3xl">
                {item.content_html ? (
                  <div dangerouslySetInnerHTML={{ __html: item.content_html }} />
                ) : (
                  <p className="text-slate-700" style={{ fontFamily: "Playfair Display, serif" }}>
                    No content yet.
                  </p>
                )}

                {/* Share / actions */}
                <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#002147] uppercase tracking-widest">Share this study</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="size-10 rounded-full bg-[#002147] text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#002147] transition-colors"
                        onClick={async () => {
                          const shareUrl = window.location.href;
                          if (navigator.share) {
                            await navigator.share({ title, text: title, url: shareUrl });
                            return;
                          }
                          await navigator.clipboard.writeText(shareUrl);
                          alert("Link copied");
                        }}
                      >
                        <span className="material-symbols-outlined text-xl">share</span>
                      </button>
                      <a
                        className="size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(window.location.href)}`}
                      >
                        <span className="material-symbols-outlined text-xl">mail</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-6 py-2 rounded-full border border-[#002147] text-[#002147] font-bold text-sm hover:bg-[#002147] hover:text-white transition-all uppercase tracking-tight"
                    >
                      Print Article
                    </button>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="px-6 py-2 rounded-full bg-[#D4AF37] text-[#002147] font-bold text-sm hover:opacity-90 transition-all uppercase tracking-tight"
                    >
                      Support Our Mission
                    </a>
                  </div>
                </div>

                {/* Back / PDF */}
                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-between">
                  <Link
                    to={`/${stateSlug}/publications`}
                    className="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
                  >
                    Back to Library
                  </Link>
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-[#002147] text-white text-sm font-bold hover:bg-slate-800 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                      Download PDF
                    </a>
                  ) : null}
                </div>
              </article>

              <aside className="space-y-12">
                <div className="p-8 bg-[#002147] text-white rounded-2xl">
                  <h5 className="serif-title text-2xl mb-4 text-[#D4AF37]">Study Resources</h5>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Enhance your study with our curated collection of guides and audio sermons.
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-[#D4AF37]">download</span> Full Study Guide (PDF)
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-[#D4AF37]">headphones</span> Audio Commentary
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-[#D4AF37]">collections_bookmark</span> Scripture Reference List
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="w-full py-3 rounded-lg bg-[#D4AF37] text-[#002147] font-bold hover:opacity-90 transition-all"
                    onClick={() => {
                      if (item.file_url) window.open(item.file_url, "_blank");
                    }}
                  >
                    Download
                  </button>
                </div>
              </aside>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
