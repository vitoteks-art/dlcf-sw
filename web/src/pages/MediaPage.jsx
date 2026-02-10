import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return "";
  const total = Number(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "";
  return value;
};

export default function MediaPage({ states = [], defaultState = "" }) {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ state: "", type: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!filters.state && defaultState) {
      setFilters((prev) => ({ ...prev, state: defaultState }));
    }
  }, [defaultState]);

  const loadItems = async () => {
    setStatus("");
    try {
      const params = new URLSearchParams();
      if (filters.state) params.set("state", filters.state);
      const data = await apiFetch(`/media-items?${params.toString()}`);
      setItems(data.items || []);
    } catch (err) {
      setItems([]);
      setStatus(err.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters.state]);

  const filteredItems = useMemo(() => {
    if (!filters.type) return items;
    return items.filter((item) => item.media_type === filters.type);
  }, [items, filters.type]);

  return (
    <section className="card retreat-page">
      <SEO
        title="Media Library"
        description="Watch and listen to messages, sermons, and special programs from DLCF South West."
      />
      <div className="retreat-head media-library-header">
        <div>
          <p className="eyebrow">Media</p>
          <h2>Streaming and Updates</h2>
          <p className="lede">
            Watch, listen, and revisit messages, special programmes, and zonal highlights.
          </p>
        </div>
        <div className="media-filter-bar">
          <label>
            State
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            >
              <option value="">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
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
              {item.scope === "state" && item.state ? (
                <span className="media-pill subtle">{item.state}</span>
              ) : (
                <span className="media-pill subtle">Zonal</span>
              )}
            </div>
            {item.thumbnail_url ? (
              <img className="media-thumb" src={item.thumbnail_url} alt={item.title} />
            ) : null}
            <h4>{item.title}</h4>
            {item.speaker ? <p className="media-item-speaker">{item.speaker}</p> : null}
            {item.description ? <p className="lede">{item.description}</p> : null}
            <div className="media-item-meta">
              <span>{formatDate(item.event_date) || "Date TBA"}</span>
              <span>{formatDuration(item.duration_seconds)}</span>
            </div>
            {item.tags ? (
              <div className="media-tags">
                {String(item.tags)
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag} className="media-tag">
                      {tag}
                    </span>
                  ))}
              </div>
            ) : null}
            <div className="media-item-actions">
              <a href={item.source_url} target="_blank" rel="noreferrer">
                Open
              </a>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 ? (
          <div className="media-empty card">
            <h4>No media items yet.</h4>
            <p className="lede">Check back for new audio and video resources.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
