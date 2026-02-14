import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function PublicationsDetailPage() {
  const params = useParams();
  const publicationId = params.id;
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

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
  const heroImg =
    item?.cover_image_url ||
    "https://images.unsplash.com/photo-1523803326055-9729b9e02e5f?auto=format&fit=crop&q=80&w=1800";

  const safeDescription = useMemo(() => (item?.description || "").trim(), [item]);

  return (
    <div className="font-display bg-[#FDFBF7] text-slate-900 min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#FDFBF7]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            className="flex items-center gap-2 text-[#002147] hover:text-[#D4AF37] transition-colors font-semibold text-sm group"
            to="/publications"
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
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              {kicker}
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              {title}
            </h1>
            {safeDescription ? (
              <p className="mt-4 text-white/85 text-lg md:text-xl max-w-3xl mx-auto" style={{ fontFamily: 'Playfair Display, serif' }}>
                {safeDescription}
              </p>
            ) : null}
          </div>
        </section>

        {/* Body */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-14">
          {status ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{status}</div>
          ) : null}

          {!item ? (
            <p className="text-slate-600">Loading publication details…</p>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
              {item.content_html ? (
                <article
                  className="article-body"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                  dangerouslySetInnerHTML={{ __html: item.content_html }}
                />
              ) : (
                <p className="text-slate-700" style={{ fontFamily: 'Playfair Display, serif' }}>
                  No content yet.
                </p>
              )}

              <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-between">
                <Link
                  to="/publications"
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
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
