import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";
import { contentSlug } from "../utils/slugs";

export default function PublicationsListPage({ user }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: "", q: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiFetch("/publication-items?scope=zonal")
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));
  }, []);

  const publicationTypes = useMemo(
    () => Array.from(new Set(items.map((item) => item.publication_type).filter(Boolean))),
    [items]
  );

  const filteredItems = useMemo(() => {
    let next = items;
    if (filters.type) next = next.filter((item) => item.publication_type === filters.type);
    const q = filters.q.trim().toLowerCase();
    if (q) {
      next = next.filter((item) => `${item.title || ""} ${item.description || ""} ${item.author || ""} ${item.tags || ""}`.toLowerCase().includes(q));
    }
    return next;
  }, [items, filters.type, filters.q]);

  return (
    <div className="public-home publications-page-premium">
      <SEO
        title="Zonal Publications"
        description="Public access to Zonal publications, manuals and outlines."
      />
      <PublicNav user={user} />

      <section className="public-hero home-hero home-hero-refined publications-page-hero">
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">Publications</p>
            <h1>
              Zonal <span>Publications</span>
            </h1>
            <p>Access manuals, outlines, and resources prepared by the publications team.</p>
          </div>
        </div>
      </section>

      <section className="public-section publications-list-shell">
        <div className="section-head publications-list-head">
          <div>
            <p className="section-kicker">All Publications</p>
            <h2>Latest releases</h2>
          </div>
          <div className="media-filter-bar publications-filter-bar">
            <label>
              Search
              <input
                type="search"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search title, author, tags"
              />
            </label>
            <label>
              Type
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All types</option>
                {publicationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {status ? <p className="status">{status}</p> : null}
        <div className="media-library-grid publications-grid-premium">
          {filteredItems.map((item) => (
            <article key={item.id} className="media-item-card publication-card-premium">
              <div className="media-item-header">
                <span className="media-pill">{item.publication_type}</span>
                <span className="media-pill subtle">Zonal</span>
              </div>
              {item.cover_image_url ? (
                <img className="media-thumb" src={item.cover_image_url} alt={item.title} />
              ) : <div className="publication-card-premium__cover" />}
              <h4>{item.title}</h4>
              {item.description ? <p className="lede">{item.description}</p> : null}
              <div className="media-item-actions">
                <Link to={`/publications/${contentSlug(item)}`}>Read More</Link>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 ? (
            <div className="media-empty card">
              <h4>No publications yet.</h4>
              <p className="lede">Check back for zonal publications.</p>
            </div>
          ) : null}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
