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

export default function StateMediaDetailPage({ stateSlug, states }) {
  const params = useParams();
  const mediaId = params.id;
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
    if (!mediaId) return;
    apiFetch(`/media-items/${mediaId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [mediaId]);

  const displayName =
    resolvedStateName ||
    stateSlug.charAt(0).toUpperCase() + stateSlug.slice(1).replace("-", " ");

  return (
    <div className="public-home">
      <StatePublicHeader stateName={displayName} stateSlug={stateSlug} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">State Media</p>
          <h1>{item?.title || displayName}</h1>
          {item?.speaker ? <p>{item.speaker}</p> : null}
        </div>
      </section>

      <section className="public-section media-detail">
        {status ? <p className="status">{status}</p> : null}
        {!item ? (
          <p className="lede">Loading media details...</p>
        ) : (
          <div className="media-detail-card">
            {item.thumbnail_url ? (
              <img className="media-thumb" src={item.thumbnail_url} alt={item.title} />
            ) : null}
            <div className="media-item-header">
              <span className="media-pill">{item.media_type}</span>
              <span className="media-pill subtle">{displayName}</span>
            </div>
            {item.description ? <p className="lede">{item.description}</p> : null}
            {item.media_type === "audio" ? (
              <audio controls src={item.source_url} style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            ) : (
              <video controls src={item.source_url} style={{ width: "100%" }}>
                Your browser does not support the video tag.
              </video>
            )}
            <div className="media-item-actions">
              <a href={item.source_url} target="_blank" rel="noreferrer">
                Open Media
              </a>
              <Link to={`/${stateSlug}/media`}>Back to Media</Link>
            </div>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
