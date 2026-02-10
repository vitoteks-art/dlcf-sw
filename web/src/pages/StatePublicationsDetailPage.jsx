import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatePublicHeader from "../components/StatePublicHeader";
import PublicFooter from "../components/PublicFooter";
import { apiFetch } from "../api";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function StatePublicationsDetailPage({ stateSlug, states }) {
  const params = useParams();
  const publicationId = params.id;
  const [item, setItem] = useState(null);
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
    if (!publicationId) return;
    apiFetch(`/publication-items/${publicationId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [publicationId]);

  const displayName =
    resolvedStateName ||
    stateSlug.charAt(0).toUpperCase() + stateSlug.slice(1).replace("-", " ");

  return (
    <div className="public-home">
      <StatePublicHeader stateName={displayName} stateSlug={stateSlug} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">State Publications</p>
          <h1>{item?.title || displayName}</h1>
          {item?.publication_type ? <p>{item.publication_type}</p> : null}
        </div>
      </section>

      <section className="public-section media-detail">
        {status ? <p className="status">{status}</p> : null}
        {!item ? (
          <p className="lede">Loading publication details...</p>
        ) : (
          <div className="media-detail-card">
            {item.cover_image_url ? (
              <img className="media-thumb" src={item.cover_image_url} alt={item.title} />
            ) : null}
            {item.description ? <p className="lede">{item.description}</p> : null}
            {item.content_html ? (
              <div className="preview-rich" dangerouslySetInnerHTML={{ __html: item.content_html }} />
            ) : null}
            <div className="media-item-actions">
              <a href={item.file_url} target="_blank" rel="noreferrer">
                Download PDF
              </a>
              <Link to={`/${stateSlug}/publications`}>Back to Publications</Link>
            </div>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
