import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

export default function PublicationsPage({ states = [], defaultState = "" }) {
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
      const data = await apiFetch(`/publication-items?${params.toString()}`);
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
    return items.filter((item) => item.publication_type === filters.type);
  }, [items, filters.type]);

  const publicationTypes = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.publication_type).filter(Boolean)));
  }, [items]);

  return (
    <section className="card retreat-page">
      <SEO
        title="Publications"
        description="Download Christian manuals, outlines, and study resources."
      />
      <div className="retreat-head media-library-header">
        <div>
          <p className="eyebrow">Publications</p>
          <h2>Digital Media Library</h2>
          <p className="lede">
            Download manuals, outlines, and study resources shared by the publications team.
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
              {item.scope === "state" && item.state ? (
                <span className="media-pill subtle">{item.state}</span>
              ) : (
                <span className="media-pill subtle">Zonal</span>
              )}
            </div>
            {item.cover_image_url ? (
              <img className="media-thumb" src={item.cover_image_url} alt={item.title} />
            ) : null}
            <h4>{item.title}</h4>
            {item.description ? <p className="lede">{item.description}</p> : null}
            {item.content_html ? (
              <div
                className="preview-rich"
                dangerouslySetInnerHTML={{ __html: item.content_html }}
              />
            ) : null}
            <div className="media-item-meta">
              <span>{item.publish_date || "Date TBA"}</span>
              <span>{item.status === "published" ? "Available" : "Draft"}</span>
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
              <a href={item.file_url} target="_blank" rel="noreferrer">
                Download
              </a>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 ? (
          <div className="media-empty card">
            <h4>No publications available.</h4>
            <p className="lede">Check back for new manuals and outlines.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
