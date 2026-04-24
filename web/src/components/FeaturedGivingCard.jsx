import { Link } from "react-router-dom";

function currency(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function FeaturedGivingCard({ item, to }) {
  const target = Number(item?.target_amount || 0);
  const raised = Number(item?.amount_raised || 0);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

  return (
    <article className="media-item-card publication-card-premium giving-card-premium featured-giving-card">
      <div className="media-item-header">
        <span className="media-pill">{String(item?.campaign_type || "campaign").replace(/_/g, " ")}</span>
        {Number(item?.is_urgent) ? <span className="media-pill subtle">Urgent</span> : null}
      </div>
      {item?.cover_image_url ? (
        <img className="media-thumb" src={item.cover_image_url} alt={item.title} />
      ) : (
        <div className="publication-card-premium__cover featured-giving-card__cover" />
      )}
      <h4>{item?.title}</h4>
      {item?.summary ? <p className="lede">{item.summary}</p> : null}
      <div className="giving-progress-meta">
        <strong>{currency(raised)}</strong>
        <span>of {currency(target)}</span>
      </div>
      <div className="giving-progress-bar"><span style={{ width: `${progress}%` }} /></div>
      <div className="media-item-actions">
        <Link to={to}>View Campaign</Link>
      </div>
    </article>
  );
}
