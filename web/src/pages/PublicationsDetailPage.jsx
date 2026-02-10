import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { apiFetch } from "../api";

export default function PublicationsDetailPage({ user }) {
  const params = useParams();
  const publicationId = params.id;
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!publicationId) return;
    apiFetch(`/publication-items/${publicationId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [publicationId]);

  return (
    <div className="public-home">
      <PublicNav user={user} />

      <section className="public-hero media-hero">
        <div className="public-hero-content">
          <p className="public-kicker">Publication Detail</p>
          <h1>{item?.title || "Publication"}</h1>
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
              <Link to="/publications">Back to Publications</Link>
            </div>
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
