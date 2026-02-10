import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

export default function PublicMediaListPage({ user }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiFetch("/media-items?scope=zonal")
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));
  }, []);

  const filteredItems = useMemo(() => {
    if (!filters.type) return items;
    return items.filter((item) => item.media_type === filters.type);
  }, [items, filters.type]);

  return (
    <div className="public-home">
      <SEO
        title="Zonal Media"
        description="Public media library significantly for Zonal events and messages."
      />
      <PublicNav user={user} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">Media Library</p>
          <h1>
            Zonal <span>Media</span>
          </h1>
          <p>Watch and listen to zonal-wide messages and special programs.</p>
        </div>
      </section>

      <section className="public-section">
        <div className="section-head">
          <div>
            <p className="section-kicker">All Media</p>
            <h2>Latest uploads</h2>
          </div>
          <div className="media-filter-bar">
            <label>
              Type
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All types</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
            </label>
          </div>
        </div>
        {status ? <p className="status">{status}</p> : null}
        <div className="media-library-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="media-item-card">
              <div className="media-item-header">
                <span className="media-pill">{item.media_type}</span>
                <span className="media-pill subtle">Zonal</span>
              </div>
              {item.thumbnail_url ? (
                <img className="media-thumb" src={item.thumbnail_url} alt={item.title} />
              ) : null}
              <h4>{item.title}</h4>
              {item.speaker ? <p className="media-item-speaker">{item.speaker}</p> : null}
              {item.description ? <p className="lede">{item.description}</p> : null}
              <div className="media-item-actions">
                <Link to={`/media/${item.id}`}>View Details</Link>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 ? (
            <div className="media-empty card">
              <h4>No media items yet.</h4>
              <p className="lede">Check back for new zonal uploads.</p>
            </div>
          ) : null}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
