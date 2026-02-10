import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { apiFetch } from "../api";

export default function PublicMediaDetailPage({ user }) {
  const params = useParams();
  const mediaId = params.id;
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!mediaId) return;
    apiFetch(`/media-items/${mediaId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [mediaId]);

  return (
    <div className="public-home">
      <PublicNav user={user} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">Media Detail</p>
          <h1>{item?.title || "Media"}</h1>
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
              <span className="media-pill subtle">Zonal</span>
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
              <Link to="/media">Back to Media</Link>
            </div>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
