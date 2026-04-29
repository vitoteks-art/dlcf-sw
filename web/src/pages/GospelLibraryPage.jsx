import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

export default function GospelLibraryPage({ user, stateSlug, states }) {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Topics");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [topics, setTopics] = useState(["All Topics"]);

  const slugifyState = (value) =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const resolvedStateName = useMemo(() => {
    if (!stateSlug || !states || states.length === 0) return null;
    const match = states.find((state) => {
      const name =
        typeof state === "string" ? state : state?.name || state?.slug || "";
      return slugifyState(name) === stateSlug;
    });
    if (!match) return null;
    return typeof match === "string" ? match : match?.name || null;
  }, [stateSlug, states]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (resolvedStateName) {
      query.set("state", resolvedStateName);
      query.set("scope", "state");
    } else {
      query.set("scope", "zonal");
    }

    apiFetch(`/publication-items?${query.toString()}`)
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));

    // Load topics dynamically from the backend (publication_type values)
    apiFetch(`/meta/publication-types?${query.toString()}`)
      .then((data) => {
        const serverTopics = (data.items || []).filter(Boolean);
        setTopics(["All Topics", ...serverTopics]);
      })
      .catch(() => {
        // Keep the page usable if this fails
        setTopics(["All Topics"]);
      });
  }, [resolvedStateName]);

  const filteredItems = useMemo(() => {
    let base = items;
    if (activeFilter !== "All Topics") {
      base = base.filter((item) => item.publication_type === activeFilter);
    }
    if (searchQuery) {
      base = base.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return base;
  }, [items, activeFilter, searchQuery]);

  const featuredStudy = useMemo(() => items[0] || null, [items]);
  const popularReads = useMemo(() => items.slice(1, 4), [items]);
  // NOTE: Removed mock "latestMedia" block. Media should come from the real API (see /media routes).

  const libraryTitle = resolvedStateName
    ? `${resolvedStateName} Library`
    : "Gospel Library";
  const libraryDesc = resolvedStateName
    ? `Explore the collection of scriptural resources and community news from ${resolvedStateName} State.`
    : "Explore our collection of scriptural resources, teachings, and community news.";

  return (
    <div className="public-home publications-page-premium gospel-library-page">
      <SEO title={libraryTitle} description={libraryDesc} />
      <PublicNav user={user} />

      <section
        className="public-hero home-hero home-hero-refined publications-page-hero"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(4, 10, 18, 0.98) 0%, rgba(4, 10, 18, 0.9) 34%, rgba(7, 15, 25, 0.48) 58%, rgba(7, 15, 25, 0.16) 100%), url("/gospel-publication-hero-premium.png")',
        }}
      >
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">Publications</p>
            <h1>
              Gospel <span>Library</span>
            </h1>
            <p>{libraryDesc}</p>
            <div className="public-cta-row home-hero-refined__actions">
              <Link className="public-btn primary" to={stateSlug ? `/${stateSlug}/media` : "/media"}>View Media</Link>
              <Link className="public-btn ghost" to={stateSlug ? `/${stateSlug}` : "/states"}>Explore Fellowship</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-values-band" aria-label="Publication page summary">
        <div className="hero-values-band__inner">
          <article className="hero-value-item">
            <span className="hero-value-item__icon">✚</span>
            <div>
              <h3>Scriptural Resources</h3>
              <p>Study outlines, doctrinal materials, and faith-building publications.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◉</span>
            <div>
              <h3>Sound Teaching</h3>
              <p>Resources rooted in Scripture, clarity, and spiritual conviction.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◎</span>
            <div>
              <h3>Discipleship</h3>
              <p>Materials that help believers grow, learn, and live the message.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◆</span>
            <div>
              <h3>Library Access</h3>
              <p>Browse publications by topic and discover the latest releases.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section publications-list-shell gospel-library-shell">
        <div className="section-head publications-list-head gospel-library-head">
          <div>
            <p className="section-kicker">Library Collection</p>
            <h2>{searchQuery ? `Search results for "${searchQuery}"` : "Latest publications"}</h2>
          </div>
          <div className="media-filter-bar publications-filter-bar gospel-library-controls">
            <label>
              Search
              <input
                type="text"
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <label>
              Topic
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {status ? <p className="status">{status}</p> : null}

        {featuredStudy && activeFilter === "All Topics" && !searchQuery ? (
          <section className="media-featured-premium gospel-featured-premium">
            <div className="media-featured-premium__grid">
              <Link
                to={stateSlug ? `/${stateSlug}/publications/${featuredStudy.id}` : `/publications/${featuredStudy.id}`}
                className="lg:col-span-2 relative aspect-video bg-black flex items-center justify-center group cursor-pointer overflow-hidden"
              >
                <img
                  alt={featuredStudy.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                  src={
                    featuredStudy.cover_image_url ||
                    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1400"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </Link>

              <div className="media-featured-premium__copy">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-4 w-fit">
                  Featured Publication
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-4">{featuredStudy.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {featuredStudy.description || "Explore the latest featured publication from our library."}
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {featuredStudy.publication_type || "Publication"}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {new Date(featuredStudy.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                    to={stateSlug ? `/${stateSlug}/publications/${featuredStudy.id}` : `/publications/${featuredStudy.id}`}
                  >
                    Read Now
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className="media-library-grid publications-grid-premium gospel-publications-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="media-item-card publication-card-premium">
              <div className="media-item-header">
                <span className="media-pill">{item.publication_type || "Publication"}</span>
                <span className="media-pill subtle">{resolvedStateName ? "State" : "Zonal"}</span>
              </div>
              {item.cover_image_url ? (
                <img className="media-thumb" src={item.cover_image_url} alt={item.title} />
              ) : (
                <div className="publication-card-premium__cover" />
              )}
              <h4>{item.title}</h4>
              {item.description ? <p className="lede">{item.description}</p> : null}
              <div className="media-item-actions">
                <Link to={stateSlug ? `/${stateSlug}/publications/${item.id}` : `/publications/${item.id}`}>Read More</Link>
              </div>
            </article>
          ))}

          {filteredItems.length === 0 ? (
            <div className="media-empty card">
              <h4>No matching publications.</h4>
              <p className="lede">Try a different topic or search term.</p>
            </div>
          ) : null}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
