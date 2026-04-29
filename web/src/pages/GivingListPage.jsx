import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

function currency(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function GivingListPage({ user, stateSlug, states }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);

  const slugifyState = (value) =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const resolvedStateName = useMemo(() => {
    if (!stateSlug || !states?.length) return null;
    const match = states.find((state) => {
      const name = typeof state === "string" ? state : state?.name || state?.slug || "";
      return slugifyState(name) === stateSlug;
    });
    return match ? (typeof match === "string" ? match : match?.name || null) : null;
  }, [stateSlug, states]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (resolvedStateName) {
      query.set("state", resolvedStateName);
      query.set("scope", "state");
    } else {
      query.set("scope", "zonal");
    }
    apiFetch(`/giving-campaigns?${query.toString()}`)
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));
  }, [resolvedStateName]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (urgentOnly && !Number(item.is_urgent)) return false;
      if (filter !== "all" && item.campaign_type !== filter) return false;
      return true;
    });
  }, [items, filter, urgentOnly]);

  const stats = useMemo(() => {
    const totalGoal = filteredItems.reduce((sum, item) => sum + Number(item.target_amount || 0), 0);
    const totalRaised = filteredItems.reduce((sum, item) => sum + Number(item.amount_raised || 0), 0);
    const urgentCount = filteredItems.filter((item) => Number(item.is_urgent)).length;
    return { totalGoal, totalRaised, urgentCount };
  }, [filteredItems]);

  const title = resolvedStateName ? `${resolvedStateName} Giving` : "Give";
  const basePath = stateSlug ? `/${stateSlug}/give` : "/give";

  return (
    <div className="public-home giving-page-premium">
      <SEO title={title} description="Support projects, urgent needs, and ministry campaigns through the DLCF giving page." />
      <PublicNav user={user} />

      <section className="public-hero home-hero home-hero-refined giving-page-hero" style={{ backgroundImage: 'linear-gradient(to right, rgba(4, 10, 18, 0.98) 0%, rgba(4, 10, 18, 0.9) 34%, rgba(7, 15, 25, 0.48) 58%, rgba(7, 15, 25, 0.16) 100%), url("/contact-hero-premium.png")' }}>
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">Giving</p>
            <h1>Support <span>Lives & Projects</span></h1>
            <p>Give toward urgent needs, ministry support, special appeals, and kingdom-impact projects.</p>
          </div>
        </div>
      </section>

      <section className="hero-values-band" aria-label="Giving summary">
        <div className="hero-values-band__inner">
          <article className="hero-value-item"><span className="hero-value-item__icon">◉</span><div><h3>{filteredItems.length}</h3><p>Active campaigns</p></div></article>
          <article className="hero-value-item"><span className="hero-value-item__icon">◆</span><div><h3>{stats.urgentCount}</h3><p>Urgent needs</p></div></article>
          <article className="hero-value-item"><span className="hero-value-item__icon">₦</span><div><h3>{currency(stats.totalGoal)}</h3><p>Total goal</p></div></article>
          <article className="hero-value-item"><span className="hero-value-item__icon">✚</span><div><h3>{currency(stats.totalRaised)}</h3><p>Raised so far</p></div></article>
        </div>
      </section>

      <section className="public-section publications-list-shell gospel-library-shell">
        <div className="section-head publications-list-head gospel-library-head">
          <div>
            <p className="section-kicker">Support Opportunities</p>
            <h2>Give to what matters now</h2>
          </div>
          <div className="media-filter-bar publications-filter-bar gospel-library-controls">
            <label>
              Category
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="project">Projects</option>
                <option value="urgent_help">Urgent Help</option>
                <option value="ministry_support">Ministry Support</option>
                <option value="special_appeal">Special Appeals</option>
              </select>
            </label>
            <label>
              Priority
              <select value={urgentOnly ? "urgent" : "all"} onChange={(e) => setUrgentOnly(e.target.value === "urgent")}>
                <option value="all">All</option>
                <option value="urgent">Urgent only</option>
              </select>
            </label>
          </div>
        </div>

        {status ? <p className="status">{status}</p> : null}

        <div className="media-library-grid publications-grid-premium gospel-publications-grid">
          {filteredItems.map((item) => {
            const target = Number(item.target_amount || 0);
            const raised = Number(item.amount_raised || 0);
            const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            return (
              <article key={item.id} className="media-item-card publication-card-premium giving-card-premium">
                <div className="media-item-header">
                  <span className="media-pill">{item.campaign_type.replace(/_/g, " ")}</span>
                  {Number(item.is_urgent) ? <span className="media-pill subtle">Urgent</span> : null}
                </div>
                {item.cover_image_url ? <img className="media-thumb" src={item.cover_image_url} alt={item.title} /> : <div className="publication-card-premium__cover" />}
                <h4>{item.title}</h4>
                {item.summary ? <p className="lede">{item.summary}</p> : null}
                <div className="giving-progress-meta">
                  <strong>{currency(raised)}</strong>
                  <span>of {currency(target)}</span>
                </div>
                <div className="giving-progress-bar"><span style={{ width: `${progress}%` }} /></div>
                <div className="media-item-actions">
                  <Link to={`${basePath}/${item.id}`}>View Campaign</Link>
                </div>
              </article>
            );
          })}
          {filteredItems.length === 0 ? <div className="media-empty card"><h4>No giving campaigns yet.</h4><p className="lede">Published opportunities will appear here.</p></div> : null}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
