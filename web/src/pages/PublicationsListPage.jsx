import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

export default function PublicationsListPage({ user }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: "" });
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
    if (!filters.type) return items;
    return items.filter((item) => item.publication_type === filters.type);
  }, [items, filters.type]);

  return (
    <div className="public-home">
      <SEO
        title="Zonal Publications"
        description="Public access to Zonal publications, manuals and outlines."
      />
      <PublicNav user={user} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">Publications</p>
          <h1>
            Zonal <span>Publications</span>
          </h1>
          <p>Access manuals, outlines, and resources prepared by the publications team.</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head">
          <div>
            <p className="section-kicker">All Publications</p>
            <h2>Latest releases</h2>
          </div>
          <div className="media-filter-bar">
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
        <div className="media-library-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="media-item-card">
              <div className="media-item-header">
                <span className="media-pill">{item.publication_type}</span>
                <span className="media-pill subtle">Zonal</span>
              </div>
              {item.cover_image_url ? (
                <img className="media-thumb" src={item.cover_image_url} alt={item.title} />
              ) : null}
              <h4>{item.title}</h4>
              {item.description ? <p className="lede">{item.description}</p> : null}
              <div className="media-item-actions">
                <Link to={`/publications/${item.id}`}>Read More</Link>
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
