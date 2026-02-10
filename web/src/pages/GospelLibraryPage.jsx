import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

export default function GospelLibraryPage({ user, stateSlug, states }) {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Topics");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const topics = [
    "All Topics",
    "Devotionals",
    "Teachings",
    "Announcements",
    "Bible Study",
    "Missions",
  ];

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
  const latestMedia = [
    {
      id: 1,
      title: 'Sunday Sermon: "The Way Back Home"',
      thumb:
        "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=300",
      type: "video",
    },
    {
      id: 2,
      title: "Choir Ministration: Hallelujah Chorus",
      thumb:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300",
      type: "video",
    },
    {
      id: 3,
      title: "Weekly Podcast: Grace and Faith",
      thumb:
        "https://images.unsplash.com/photo-1478737270239-2fccd2c7862a?auto=format&fit=crop&q=80&w=300",
      type: "audio",
    },
  ];

  const libraryTitle = resolvedStateName
    ? `${resolvedStateName} Library`
    : "Gospel Library";
  const libraryDesc = resolvedStateName
    ? `Explore the collection of scriptural resources and community news from ${resolvedStateName} State.`
    : "Explore our collection of scriptural resources, teachings, and community news.";

  return (
    <div className="premium-state-page gospel-library-page">
      <SEO title={libraryTitle} description={libraryDesc} />

      <main className="library-wrapper">
                <header className="library-header">
                    <div className="library-inner header-inner">
                        <div className="library-top">
                            <Link className="library-brand" to="/">
                                <img src="/logo.png" alt="Gospel Library" />
                                <span>Gospel Library</span>
                            </Link>
              <div className="library-search">
                <span className="icon">🔎</span>
                <input
                  type="text"
                  placeholder="Search publications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <nav className="library-nav">
                {["Home", "Library", "Archive"].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase()}`}
                    className={link === "Library" ? "active" : ""}
                  >
                    {link}
                  </Link>
                ))}
              </nav>
                            <Link to="/signin" className="btn-signin">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="topic-chips-wrapper">
                    <div className="topic-chips">
                        {topics.map((topic) => (
                            <button
                                key={topic}
                                className={`chip ${activeFilter === topic ? "active" : ""}`}
                                onClick={() => setActiveFilter(topic)}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

        <div className="library-inner">
          {/* Featured Study Section */}
          {featuredStudy && activeFilter === "All Topics" && !searchQuery && (
            <section className="featured-study-hero">
              <div className="featured-card">
                <div className="featured-img">
                  <img
                    src={
                      featuredStudy.cover_image_url ||
                      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800"
                    }
                    alt="Featured Study"
                  />
                </div>
                <div className="featured-content">
                  <span className="section-label">Featured Study</span>
                  <h2>{featuredStudy.title}</h2>
                  <p className="meta">
                    Published on{" "}
                    {new Date(featuredStudy.created_at).toLocaleDateString()} •{" "}
                    {featuredStudy.reading_time || "10 min read"}
                  </p>
                  <p className="excerpt">
                    {featuredStudy.description ||
                      "Explore the transformative nature of divine grace and how it shapes our daily walk..."}
                  </p>
                  <Link
                    to={
                      stateSlug
                        ? `/${stateSlug}/publications/${featuredStudy.id}`
                        : `/publications/${featuredStudy.id}`
                    }
                    className="continue-reading"
                  >
                    Continue Reading <span>→</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Library Layout Grid */}
          <div className="library-layout-grid">
            {/* Main Content Area */}
            <div className="library-main">
              <div className="section-header" style={{ marginBottom: "32px" }}>
                <h2>
                  {searchQuery
                    ? `Search results for \"${searchQuery}\"`
                    : "Latest Publications"}
                </h2>
              </div>

              <div className="publications-grid">
                {filteredItems.map((item) => (
                  <article key={item.id} className="publication-card simple">
                    <div className="card-thumb">
                      <img
                        src={
                          item.cover_image_url ||
                          "https://images.unsplash.com/photo-1490127252417-7c393f993ee4?auto=format&fit=crop&q=80&w=400"
                        }
                        alt={item.title}
                      />
                    </div>
                    <div className="card-body">
                      <div className="card-meta">
                        <span className="card-tag">
                          {item.publication_type}
                        </span>
                        <span className="card-date">
                          •{" "}
                          {new Date(item.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <h4>{item.title}</h4>
                      <p>
                        {item.description ||
                          "A deep dive into scriptural truths and practical applications..."}
                      </p>
                      <Link
                        to={
                          stateSlug
                            ? `/${stateSlug}/publications/${item.id}`
                            : `/publications/${item.id}`
                        }
                        className="read-more"
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div
                  className="empty-state centered"
                  style={{ padding: "80px 0" }}
                >
                  <h3>No matching publications</h3>
                  <p>
                    We couldn't find anything matching your current filters. Try
                    a different topic or search term.
                  </p>
                </div>
              )}

              {filteredItems.length > 5 && (
                <div className="centered" style={{ padding: "60px 0" }}>
                  <button
                    className="btn-glass-large"
                    style={{ color: "var(--text-main)", borderColor: "#eee" }}
                  >
                    Load More Articles
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Area */}
            <aside className="library-sidebar">
              <div className="sidebar-widget">
                <h4 className="widget-title">
                  <span className="icon">📈</span> Popular This Month
                </h4>
                <div className="popular-list">
                  {popularReads.map((item) => (
                    <Link
                      key={item.id}
                      to={
                        stateSlug
                          ? `/${stateSlug}/publications/${item.id}`
                          : `/publications/${item.id}`
                      }
                      className="popular-item"
                    >
                      <img
                        src={
                          item.cover_image_url ||
                          "https://images.unsplash.com/photo-1519781542704-957ff19ef00a?auto=format&fit=crop&q=80&w=150"
                        }
                        alt={item.title}
                      />
                      <div className="pop-body">
                        <h5>{item.title}</h5>
                        <p>{item.popularity_meta || "4.2k Reads"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-widget">
                <h4 className="widget-title">
                  <span className="icon">▶️</span> Latest Media
                </h4>
                <div className="media-mini-grid">
                  {latestMedia.map((media) => (
                    <div key={media.id} className="media-mini-card">
                      <div className="mini-thumb">
                        <img src={media.thumb} alt={media.title} />
                        <div className="play-overlay">
                          <span>{media.type === "video" ? "▶" : "🎧"}</span>
                        </div>
                      </div>
                      <p>{media.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-widget newsletter-widget">
                <h3>Subscribe to Updates</h3>
                <p>
                  Get the latest study outlines and devotionals delivered
                  directly to your inbox.
                </p>
                <div className="subscribe-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      marginBottom: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  />
                  <button
                    className="btn-primary-large"
                    style={{ width: "100%", padding: "12px" }}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
