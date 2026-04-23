import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch } from "../api";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const defaultMainHomeContent = {
  hero: {
    kicker: "Deeper Life Campus Fellowship",
    title: "Inspiring",
    highlight: "Leadership",
    body: "Raising disciples through worship, the word, and authentic community across campuses, workplaces, and cities.",
    primaryCtaLabel: "Join Us",
    primaryCtaUrl: "#cta",
    secondaryCtaLabel: "Upcoming Events",
    secondaryCtaUrl: "#events",
    backgroundImageUrl: "",
    metaPrimary: "Sunday Worship",
    metaSecondary: "10:00 AM & 4:00 PM",
  },
  about: {
    label: "Who we are",
    title: "Welcome to DLCF South West",
    body: "Experience inspiring worship, enlightening word, and gracious wonders. We are a people saved by grace, empowered by the Holy Spirit, and committed to authentic Bible Christianity across campuses and cities.",
    imageUrl: "/hero-image.jpg",
    pills: ["Our mandate", "We exist primarily", "Passionate about God"],
  },
  mediaSpotlight: {
    label: "Learn and gain spiritual upliftment",
    title: "Watch & Download Sermons",
    body: "Explore fresh media messages, devotionals, and teaching resources that strengthen faith and discipleship.",
    ctaPrimaryLabel: "Get Started",
    ctaPrimaryUrl: "/media",
    ctaSecondaryLabel: "Publications",
    ctaSecondaryUrl: "/publications",
  },
  statesHighlight: {
    label: "From the States",
    title: "State-wide highlights",
    body: "Stay connected with what God is doing across states, campuses, and fellowship centres.",
    cards: [{ title: "Browse States", body: "Explore state pages, fellowship directories, and local updates.", ctaLabel: "Browse States", ctaUrl: "/states" }],
  },
  eventsAnnouncements: {
    label: "Featured Updates",
    title: "Events & Announcements",
    body: "Keep the homepage fresh with featured programmes, notices, and ministry updates.",
    items: [
      { title: "State Congress Preparation", meta: "TBA", type: "Event" },
      { title: "Zonal Congress Registration", meta: "TBA", type: "Event" },
      { title: "Weekly Attendance Portal Update", meta: "TBA", type: "Announcement" },
    ],
  },
  mentor: {
    label: "Our Mentor",
    title: "Pastor W.F. Kumuyi",
    body: "The history of Deeper Life Campus Fellowship cannot be written without mentioning the human agent God used to start Deeper Christian Life Ministry, of which DLCF is an arm.",
    imageUrl: "/src/assets/gs.png",
    quote: "A life devoted to biblical truth, holiness, and raising disciples for Christ.",
  },
  finalCta: {
    label: "Take the Next Step",
    title: "Find your fellowship community",
    body: "Connect with a campus fellowship, discover resources, and stay rooted in the Word wherever you are.",
    primaryLabel: "Browse States",
    primaryUrl: "/states",
    secondaryLabel: "Watch Messages",
    secondaryUrl: "/media",
    imageUrl: "",
  },
};

const normalizeContent = (input) => ({
  ...defaultMainHomeContent,
  ...(input || {}),
  hero: { ...defaultMainHomeContent.hero, ...((input || {}).hero || {}) },
  about: {
    ...defaultMainHomeContent.about,
    ...((input || {}).about || {}),
    pills:
      Array.isArray((input || {}).about?.pills) && (input || {}).about.pills.length > 0
        ? (input || {}).about.pills
        : defaultMainHomeContent.about.pills,
  },
  mediaSpotlight: { ...defaultMainHomeContent.mediaSpotlight, ...((input || {}).mediaSpotlight || {}) },
  statesHighlight: {
    ...defaultMainHomeContent.statesHighlight,
    ...((input || {}).statesHighlight || {}),
    cards:
      Array.isArray((input || {}).statesHighlight?.cards) && (input || {}).statesHighlight.cards.length > 0
        ? (input || {}).statesHighlight.cards
        : defaultMainHomeContent.statesHighlight.cards,
  },
  eventsAnnouncements: {
    ...defaultMainHomeContent.eventsAnnouncements,
    ...((input || {}).eventsAnnouncements || {}),
    items:
      Array.isArray((input || {}).eventsAnnouncements?.items) && (input || {}).eventsAnnouncements.items.length > 0
        ? (input || {}).eventsAnnouncements.items
        : defaultMainHomeContent.eventsAnnouncements.items,
  },
  mentor: { ...defaultMainHomeContent.mentor, ...((input || {}).mentor || {}) },
  finalCta: { ...defaultMainHomeContent.finalCta, ...((input || {}).finalCta || {}) },
});

export default function PublicHome({ states, stateSummaries, user }) {
  const arms = [
    { title: "Students", desc: "Campus fellowships, training, and discipleship for students." },
    { title: "Staff", desc: "Workplace fellowship and mentoring for staff members." },
    { title: "Corps Members", desc: "Support and community for corpers serving nationwide." },
  ];
  const [mainHomeContent, setMainHomeContent] = useState(defaultMainHomeContent);
  const [mediaItems, setMediaItems] = useState([]);
  const [publicationItems, setPublicationItems] = useState([]);
  const [stateMediaItems, setStateMediaItems] = useState([]);
  const [statePublicationItems, setStatePublicationItems] = useState([]);

  useEffect(() => {
    apiFetch("/public/main-home")
      .then((data) => setMainHomeContent(normalizeContent(data.item || null)))
      .catch(() => setMainHomeContent(defaultMainHomeContent));
    apiFetch("/media-items")
      .then((data) => setMediaItems(data.items || []))
      .catch(() => setMediaItems([]));
    apiFetch("/publication-items")
      .then((data) => setPublicationItems(data.items || []))
      .catch(() => setPublicationItems([]));
    apiFetch("/media-items?scope=state")
      .then((data) => setStateMediaItems(data.items || []))
      .catch(() => setStateMediaItems([]));
    apiFetch("/publication-items?scope=state")
      .then((data) => setStatePublicationItems(data.items || []))
      .catch(() => setStatePublicationItems([]));
  }, []);

  const featuredMedia = useMemo(() => mediaItems.slice(0, 3), [mediaItems]);
  const featuredPublications = useMemo(() => publicationItems.slice(0, 3), [publicationItems]);
  const featuredStateMedia = useMemo(() => stateMediaItems.slice(0, 3), [stateMediaItems]);
  const featuredStatePublications = useMemo(() => statePublicationItems.slice(0, 3), [statePublicationItems]);
  const content = useMemo(() => normalizeContent(mainHomeContent), [mainHomeContent]);

  return (
    <div className="public-home">
      <SEO title="Home" description="Deeper Life Campus Fellowship - Inspiring Leadership. Raising disciples through worship, the word, and authentic community." />
      <PublicNav user={user} />

      <section
        className="public-hero home-hero"
        style={content.hero.backgroundImageUrl ? { backgroundImage: `linear-gradient(rgba(7, 11, 19, 0.55), rgba(7, 11, 19, 0.72)), url(${content.hero.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="public-hero-content">
          <p className="public-kicker">{content.hero.kicker}</p>
          <h1>
            {content.hero.title} <span>{content.hero.highlight}</span>
          </h1>
          <p>{stripHtml(content.hero.body)}</p>
          <div className="public-cta-row">
            <a className="public-btn primary" href={content.hero.primaryCtaUrl || "#cta"}>{content.hero.primaryCtaLabel || "Join Us"}</a>
            <a className="public-btn ghost" href={content.hero.secondaryCtaUrl || "#events"}>{content.hero.secondaryCtaLabel || "Upcoming Events"}</a>
          </div>
          <div className="public-meta">
            <span>{content.hero.metaPrimary}</span>
            <span>{content.hero.metaSecondary}</span>
          </div>
        </div>
      </section>

      <section className="public-section about-intro">
        <div className="about-media">
          <div className="about-frame">
            <img src={content.about.imageUrl || "/hero-image.jpg"} alt="DLCF South West leadership" />
          </div>
          <span className="about-orb orb-top" />
          <span className="about-orb orb-bottom" />
        </div>
        <div className="about-content">
          <p className="section-kicker">{content.about.label}</p>
          <h2>{content.about.title}</h2>
          <p>{stripHtml(content.about.body)}</p>
          <div className="about-pill-row">
            {(content.about.pills || []).filter(Boolean).map((pill) => <span key={pill}>{pill}</span>)}
          </div>
        </div>
      </section>

      <section className="public-section media-cta">
        <div className="media-cta-overlay" />
        <div className="media-cta-content">
          <p className="media-cta-kicker">{content.mediaSpotlight.label}</p>
          <h2>{content.mediaSpotlight.title}</h2>
          <p style={{ maxWidth: 620, margin: "0 auto 1rem" }}>{stripHtml(content.mediaSpotlight.body)}</p>
          <div className="public-cta-row" style={{ justifyContent: "center" }}>
            <Link className="public-btn bright" to={content.mediaSpotlight.ctaPrimaryUrl || "/media"}>{content.mediaSpotlight.ctaPrimaryLabel || "Get Started"}</Link>
            {content.mediaSpotlight.ctaSecondaryLabel ? <Link className="public-btn ghost" to={content.mediaSpotlight.ctaSecondaryUrl || "/publications"}>{content.mediaSpotlight.ctaSecondaryLabel}</Link> : null}
          </div>
        </div>
      </section>

      <section className="public-section media-preview">
        <div className="section-head">
          <div>
            <p className="section-kicker">Media &amp; Publications</p>
            <h2>Latest uploads</h2>
          </div>
          <div className="preview-actions">
            <Link to="/media">Media Library</Link>
            <Link to="/publications">Publications</Link>
          </div>
        </div>
        <div className="media-preview-grid">
          <div className="media-preview-card">
            <div className="preview-head"><h3>Media</h3><p className="lede">Audio &amp; video messages.</p></div>
            <div className="preview-list">
              {featuredMedia.length === 0 ? <p className="lede">New media coming soon.</p> : featuredMedia.map((item) => (
                <a key={item.id} className="preview-item" href={item.source_url} target="_blank" rel="noreferrer"><div><h4>{item.title}</h4><p>{item.speaker || item.series || item.media_type}</p></div><span className="preview-pill">{item.media_type}</span></a>
              ))}
            </div>
          </div>
          <div className="media-preview-card">
            <div className="preview-head"><h3>Publications</h3><p className="lede">Manuals, outlines, and resources.</p></div>
            <div className="preview-list">
              {featuredPublications.length === 0 ? <p className="lede">New publications coming soon.</p> : featuredPublications.map((item) => (
                <a key={item.id} className="preview-item" href={item.file_url} target="_blank" rel="noreferrer"><div><h4>{item.title}</h4><p>{item.publication_type}</p></div><span className="preview-pill">PDF</span></a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section media-preview">
        <div className="section-head">
          <div>
            <p className="section-kicker">{content.statesHighlight.label}</p>
            <h2>{content.statesHighlight.title}</h2>
            <p className="lede">{stripHtml(content.statesHighlight.body)}</p>
          </div>
          <div className="preview-actions"><Link to="/states">Browse States</Link></div>
        </div>
        <div className="media-preview-grid">
          <div className="media-preview-card">
            <div className="preview-head"><h3>State Media</h3><p className="lede">Recent media across all states.</p></div>
            <div className="preview-list">
              {featuredStateMedia.length === 0 ? <p className="lede">No state media yet.</p> : featuredStateMedia.map((item) => {
                const stateSlug = slugifyState(item.state || "");
                const target = stateSlug ? `/${stateSlug}/media/${item.id}` : "/states";
                return <Link key={item.id} className="preview-item" to={target}><div><h4>{item.title}</h4><p>{item.state || "State"}</p></div><span className="preview-pill">{item.media_type}</span></Link>;
              })}
            </div>
          </div>
          <div className="media-preview-card">
            <div className="preview-head"><h3>State Publications</h3><p className="lede">Recent publications across all states.</p></div>
            <div className="preview-list">
              {featuredStatePublications.length === 0 ? <p className="lede">No state publications yet.</p> : featuredStatePublications.map((item) => {
                const stateSlug = slugifyState(item.state || "");
                const target = stateSlug ? `/${stateSlug}/publications/${item.id}` : "/states";
                return <Link key={item.id} className="preview-item" to={target}><div><h4>{item.title}</h4><p>{item.state || "State"}</p></div><span className="preview-pill">PDF</span></Link>;
              })}
            </div>
          </div>
        </div>
        {Array.isArray(content.statesHighlight.cards) && content.statesHighlight.cards.length > 0 ? (
          <div className="arms-grid" style={{ marginTop: "2rem" }}>
            {content.statesHighlight.cards.map((card, idx) => (
              <div key={`${card.title}-${idx}`} className="arms-card">
                <div className="arms-icon">{(card.title || "H").charAt(0)}</div>
                <h3>{card.title || "Highlight"}</h3>
                <p>{stripHtml(card.body)}</p>
                <Link to={card.ctaUrl || "/states"}>{card.ctaLabel || "Explore"}</Link>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section id="arms" className="public-section arms">
        <p className="section-kicker">DLCF Arms</p>
        <h2>Students, Staff, and Corps Members</h2>
        <div className="arms-grid">
          {arms.map((arm) => (
            <div key={arm.title} className="arms-card"><div className="arms-icon">{arm.title.charAt(0)}</div><h3>{arm.title}</h3><p>{arm.desc}</p><Link to="/states">Learn more</Link></div>
          ))}
        </div>
      </section>

      <section id="our-mentor" className="public-section mentor-section">
        <div className="mentor-grid">
          <div className="mentor-copy">
            <p className="section-kicker">{content.mentor.label}</p>
            <h2>{content.mentor.title}</h2>
            <p>{stripHtml(content.mentor.body)}</p>
            {content.mentor.quote ? <p><em>{content.mentor.quote}</em></p> : null}
          </div>
          <div className="mentor-media">
            <div className="mentor-frame"><img src={content.mentor.imageUrl || "/src/assets/gs.png"} alt="General Superintendent" /></div>
            <div className="mentor-caption">General Superintendent (GS)</div>
          </div>
        </div>
      </section>

      <section id="events" className="public-section events">
        <div className="section-head">
          <div>
            <p className="section-kicker">{content.eventsAnnouncements.label}</p>
            <h2>{content.eventsAnnouncements.title}</h2>
            <p className="lede">{stripHtml(content.eventsAnnouncements.body)}</p>
          </div>
          <Link to="/events">View All Events</Link>
        </div>
        <div className="homepage-updates-grid">
          {(content.eventsAnnouncements.items || []).map((item, idx) => {
            const typeLabel = String(item.type || "Update").trim() || "Update";
            const isAnnouncement = /announcement|news|update/i.test(typeLabel);
            return (
              <article
                key={`${item.title}-${idx}`}
                className={`homepage-update-card ${isAnnouncement ? "announcement" : "event"}`}
              >
                <div className="homepage-update-card__top">
                  <span className="homepage-update-card__badge">{typeLabel}</span>
                  <span className="homepage-update-card__meta">{item.meta || "Details coming soon"}</span>
                </div>
                <h3>{item.title || "Homepage update"}</h3>
                <p>
                  {isAnnouncement
                    ? "Important ministry update curated for the main homepage audience."
                    : "Featured programme spotlight curated for the main homepage audience."}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="states" className="public-section states">
        <p className="section-kicker">States Overview</p>
        <h2>Explore all 13 states</h2>
        <div className="states-grid">
          {states.length === 0 ? <div className="state-tile">No states loaded yet</div> : states.map((state) => {
            const stateName = typeof state === "string" ? state : state?.name || state;
            const slugSource = typeof state === "string" ? state : state?.slug || state?.name || state;
            return <Link to={`/${slugifyState(slugSource)}`} key={stateName} style={{ textDecoration: "none", color: "inherit" }}><div className="state-tile">{stateName}</div></Link>;
          })}
        </div>
      </section>

      <section id="cta" className="public-section callout">
        <p className="section-kicker">{content.finalCta.label}</p>
        <h2>{content.finalCta.title}</h2>
        <p>{stripHtml(content.finalCta.body)}</p>
        <div className="public-cta-row">
          <Link className="public-btn primary" to={content.finalCta.primaryUrl || "/states"}>{content.finalCta.primaryLabel || "Find Your State"}</Link>
          {content.finalCta.secondaryLabel ? <Link className="public-btn ghost" to={content.finalCta.secondaryUrl || "/media"}>{content.finalCta.secondaryLabel}</Link> : null}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
