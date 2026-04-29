import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

function currency(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function GivingDetailPage({ campaignId: campaignIdProp }) {
  const params = useParams();
  const campaignId = campaignIdProp || params.id;
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!campaignId) return;
    apiFetch(`/giving-campaigns/${campaignId}`)
      .then((data) => setItem(data.item || null))
      .catch((err) => setStatus(err.message));
  }, [campaignId]);

  const progress = useMemo(() => {
    const target = Number(item?.target_amount || 0);
    const raised = Number(item?.amount_raised || 0);
    return target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  }, [item]);

  return (
    <div className="public-home giving-detail-page">
      <SEO title={item?.title || "Giving Campaign"} description={item?.summary || "Support this giving campaign."} />
      <PublicNav />
      <section className="public-section" style={{ paddingTop: "8rem" }}>
        {status ? <div className="card"><p className="status">{status}</p></div> : null}
        {!item ? (
          <div className="card"><p className="lede">Loading campaign…</p></div>
        ) : (
          <div className="giving-detail-layout">
            <article className="card giving-detail-main">
              {item.cover_image_url ? <img className="giving-detail-image" src={item.cover_image_url} alt={item.title} /> : null}
              <div className="media-item-header">
                <span className="media-pill">{item.campaign_type.replace(/_/g, " ")}</span>
                {Number(item.is_urgent) ? <span className="media-pill subtle">Urgent</span> : null}
              </div>
              <h1>{item.title}</h1>
              {item.summary ? <p className="lede">{item.summary}</p> : null}
              {item.description_html ? <div dangerouslySetInnerHTML={{ __html: item.description_html }} /> : null}
            </article>
            <aside className="card giving-detail-side">
              <h3>Giving Summary</h3>
              <div className="giving-progress-meta"><strong>{currency(item.amount_raised)}</strong><span>of {currency(item.target_amount)}</span></div>
              <div className="giving-progress-bar"><span style={{ width: `${progress}%` }} /></div>
              {item.deadline ? <p><strong>Deadline:</strong> {item.deadline}</p> : null}
              {item.beneficiary_name ? <p><strong>Beneficiary:</strong> {item.beneficiary_name}</p> : null}
              <div className="giving-payment-box">
                <h4>How to Give</h4>
                <p>{item.payment_details || "Please contact the church admin for payment instructions."}</p>
              </div>
              <Link to="/give" className="public-btn primary">Back to Giving</Link>
            </aside>
          </div>
        )}
      </section>
      <PublicFooter />
    </div>
  );
}
