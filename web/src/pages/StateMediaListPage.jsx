import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatePublicHeader from "../components/StatePublicHeader";
import PublicFooter from "../components/PublicFooter";
import { apiFetch } from "../api";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function StateMediaListPage({ stateSlug, states }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ type: "" });
  const [status, setStatus] = useState("");

  const resolvedStateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      if (typeof state === "string") {
        return slugifyState(state) === stateSlug;
      }
      if (state?.slug) {
        return slugifyState(state.slug) === stateSlug;
      }
      if (state?.name) {
        return slugifyState(state.name) === stateSlug;
      }
      return false;
    });
    if (!match) return null;
    return typeof match === "string" ? match : match?.name || null;
  }, [stateSlug, states]);

  useEffect(() => {
    if (!resolvedStateName) return;
    const params = new URLSearchParams({
      state: resolvedStateName,
      scope: "state",
    });
    apiFetch(`/media-items?${params.toString()}`)
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));
  }, [resolvedStateName]);

  const filteredItems = useMemo(() => {
    if (!filters.type) return items;
    return items.filter((item) => item.media_type === filters.type);
  }, [items, filters.type]);

  const displayName =
    resolvedStateName ||
    stateSlug.charAt(0).toUpperCase() + stateSlug.slice(1).replace("-", " ");

  return (
    <div className="public-home">
      <StatePublicHeader stateName={displayName} stateSlug={stateSlug} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">State Media</p>
          <h1>{displayName} Media</h1>
          <p>Audio and video messages from {displayName} State.</p>
        </div>
      </section>

      <section className="public-section media-preview">
        <div className="section-head">
          <div>
            <p className="section-kicker">Media Library</p>
            <h2>Latest state uploads</h2>
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
                <span className="media-pill subtle">{displayName}</span>
              </div>
              {item.thumbnail_url ? (
                <img className="media-thumb" src={item.thumbnail_url} alt={item.title} />
              ) : null}
              <h4>{item.title}</h4>
              {item.speaker ? <p className="media-item-speaker">{item.speaker}</p> : null}
              {item.description ? <p className="lede">{item.description}</p> : null}
              <div className="media-item-actions">
                <Link to={`/${stateSlug}/media/${item.id}`}>View Details</Link>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 ? (
            <div className="media-empty card">
              <h4>No media items yet.</h4>
              <p className="lede">Check back for state uploads.</p>
            </div>
          ) : null}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
