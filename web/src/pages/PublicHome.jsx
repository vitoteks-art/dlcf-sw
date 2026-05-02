import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import FeaturedGivingCard from "../components/FeaturedGivingCard";
import { API_BASE, apiFetch } from "../api";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const normalizeImageUrl = (value, fallback = "") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/")) {
    const cleaned = raw.startsWith("/") ? raw : `/${raw}`;
    return `https://api.dlcfsw.org.ng${cleaned}`;
  }
  if (raw.startsWith("/")) return raw;
  return raw;
};

const contentIdentifier = (item) => item?.slug || item?.id;
const mediaDetailPath = (item) => item?.scope === "state" && item?.state
  ? `/${slugifyState(item.state)}/media/${contentIdentifier(item)}`
  : `/media/${contentIdentifier(item)}`;
const publicationDetailPath = (item) => item?.scope === "state" && item?.state
  ? `/${slugifyState(item.state)}/publications/${contentIdentifier(item)}`
  : `/publications/${contentIdentifier(item)}`;
const mediaThumbnail = (item) => normalizeImageUrl(item?.thumbnail_url || (item?.media_type === "image" ? item?.source_url : ""), "");
const publicationThumbnail = (item) => normalizeImageUrl(item?.cover_image_url || "", "");

function DashboardThumb({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  return <div className={className}>{src && !failed ? <img src={src} alt={alt || "Media thumbnail"} loading="lazy" onError={() => setFailed(true)} /> : null}</div>;
}

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
  const [featuredGivingItems, setFeaturedGivingItems] = useState([]);
  const [zonalEvents, setZonalEvents] = useState([]);

  useEffect(() => {
    apiFetch("/public/main-home.php")
      .then((data) => setMainHomeContent(normalizeContent(data.item || null)))
      .catch(() =>
        apiFetch("/public/main-home")
          .then((data) => setMainHomeContent(normalizeContent(data.item || null)))
          .catch(() => setMainHomeContent(defaultMainHomeContent))
      );
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
    apiFetch("/giving-campaigns?scope=zonal&featured=1")
      .then((data) => setFeaturedGivingItems(data.items || []))
      .catch(() => setFeaturedGivingItems([]));
    apiFetch("/public/zonal-events.php")
      .then((data) => setZonalEvents(data.items || []))
      .catch(() => setZonalEvents([]));
  }, []);

  const featuredMedia = useMemo(() => mediaItems.slice(0, 3), [mediaItems]);
  const featuredPublications = useMemo(() => publicationItems.slice(0, 3), [publicationItems]);
  const featuredStateMedia = useMemo(() => stateMediaItems.slice(0, 3), [stateMediaItems]);
  const featuredStatePublications = useMemo(() => statePublicationItems.slice(0, 3), [statePublicationItems]);
  const featuredGiving = useMemo(() => featuredGivingItems.slice(0, 3), [featuredGivingItems]);
  const content = useMemo(() => normalizeContent(mainHomeContent), [mainHomeContent]);
  const heroBackgroundImage = useMemo(() => normalizeImageUrl(content.hero.backgroundImageUrl, ""), [content.hero.backgroundImageUrl]);
  const aboutImage = useMemo(() => normalizeImageUrl(content.about.imageUrl, "/hero-image.jpg"), [content.about.imageUrl]);
  const mentorImage = useMemo(() => normalizeImageUrl(content.mentor.imageUrl, "/src/assets/gs.png"), [content.mentor.imageUrl]);
  const dashboardItems = content.eventsAnnouncements.items || [];
  const dashboardEvents = (zonalEvents.length ? zonalEvents.map((item) => ({
    ...item,
    title: item.title,
    meta: item.event_start_date || item.event_time_label || "TBA",
    imageUrl: item.feature_image_url,
    url: `/events/${item.slug || item.id}`,
  })) : dashboardItems.filter((item) => !/announcement|news|update/i.test(String(item.type || "")))).slice(0, 2);
  const dashboardAnnouncements = dashboardItems.filter((item) => /announcement|news|update/i.test(String(item.type || ""))).slice(0, 3);
  const dashboardStates = (Array.isArray(states) ? states : []).slice(0, 5).map((state) => {
    const stateName = typeof state === "string" ? state : state?.name || state;
    const stateSlug = slugifyState(typeof state === "string" ? state : state?.slug || state?.name || state);
    const summary = Array.isArray(stateSummaries)
      ? stateSummaries.find((entry) => slugifyState(entry?.state || entry?.name || "") === stateSlug)
      : null;
    return { name: stateName, slug: stateSlug, campuses: summary?.campus_count || summary?.campuses || null };
  });

  return (
    <div className="public-home">
      <SEO title="Home" description="Deeper Life Campus Fellowship - Inspiring Leadership. Raising disciples through worship, the word, and authentic community." />
      <PublicNav user={user} />

      <section
        className="public-hero home-hero home-hero-refined"
        style={heroBackgroundImage ? { backgroundImage: `linear-gradient(90deg, rgba(4, 10, 18, 0.98) 0%, rgba(4, 10, 18, 0.9) 34%, rgba(7, 15, 25, 0.52) 56%, rgba(7, 15, 25, 0.16) 100%), url(${heroBackgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">{content.hero.kicker}</p>
            <h1>
              {content.hero.title} <span>{content.hero.highlight}</span>
            </h1>
            <p>{stripHtml(content.hero.body)}</p>
            <div className="public-cta-row home-hero-refined__actions">
              <a className="public-btn primary" href={content.hero.primaryCtaUrl || "#cta"}>{content.hero.primaryCtaLabel || "Join Us"}</a>
              <a className="public-btn ghost" href={content.hero.secondaryCtaUrl || "#events"}>{content.hero.secondaryCtaLabel || "Upcoming Events"}</a>
            </div>
            <div className="public-meta home-hero-refined__meta">
              <span>{content.hero.metaPrimary}</span>
              <span>{content.hero.metaSecondary}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-values-band" aria-label="Core values">
        <div className="hero-values-band__inner">
          <article className="hero-value-item">
            <span className="hero-value-item__icon">✚</span>
            <div>
              <h3>Christ-Centred</h3>
              <p>We are rooted in the Word and led by the Spirit.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">👥</span>
            <div>
              <h3>Campus Focused</h3>
              <p>Reaching every campus, transforming every student.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◎</span>
            <div>
              <h3>Kingdom Impact</h3>
              <p>Raising leaders who will transform society.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">❤</span>
            <div>
              <h3>Love in Action</h3>
              <p>Demonstrating Christ’s love on and off our campuses.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section about-intro">
        <div className="about-media">
          <div className="about-frame">
            <img src={aboutImage} alt="DLCF South West leadership" />
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

      <section className="public-section homepage-dashboard">
        <div className="homepage-dashboard__grid">
          <article className="homepage-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>Featured Events</h3>
              <Link to="/events">View All</Link>
            </div>
            <div className="homepage-dashboard__list">
              {dashboardEvents.length === 0 ? <p className="homepage-dashboard__empty">Featured events will appear here.</p> : dashboardEvents.map((item, idx) => (
                <Link key={`${item.title}-${idx}`} to={item.url || "/events"} className="homepage-dashboard__event-item">
                  <DashboardThumb className="homepage-dashboard__thumb" src={normalizeImageUrl(item.imageUrl || item.feature_image_url, "")} alt={item.title} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta || "TBA"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="homepage-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>Announcements</h3>
              <Link to="/events">View All</Link>
            </div>
            <div className="homepage-dashboard__list homepage-dashboard__list--compact">
              {dashboardAnnouncements.length === 0 ? <p className="homepage-dashboard__empty">Announcements will appear here.</p> : dashboardAnnouncements.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="homepage-dashboard__bullet-item">
                  <span className="homepage-dashboard__bullet" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.meta || "Latest update"}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="homepage-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>Mentor Spotlight</h3>
              <Link to="/about#our-mentor">View All</Link>
            </div>
            <div className="homepage-dashboard__mentor">
              <img src={mentorImage} alt="Mentor spotlight" />
              <div>
                <strong>{content.mentor.title}</strong>
                <span>{content.mentor.label || "DLCF South West Mentor"}</span>
                <p>{stripHtml(content.mentor.body).slice(0, 120)}...</p>
              </div>
            </div>
          </article>

          <article className="homepage-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>State Highlights</h3>
              <Link to="/states">View All</Link>
            </div>
            <div className="homepage-dashboard__list homepage-dashboard__list--compact">
              {dashboardStates.length === 0 ? <p className="homepage-dashboard__empty">States will appear here.</p> : dashboardStates.map((item) => (
                <Link key={item.slug || item.name} className="homepage-dashboard__state-item" to={item.slug ? `/${item.slug}` : "/states"}>
                  <strong>{String(item.name || "State").toUpperCase()}</strong>
                  <span>{item.campuses ? `${item.campuses} Campuses` : "View State"}</span>
                </Link>
              ))}
            </div>
          </article>

          <article className="homepage-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>Media &amp; Publications</h3>
              <Link to="/media">View All</Link>
            </div>
            <div className="homepage-dashboard__media-feature">
              {featuredMedia[0] ? <Link to={mediaDetailPath(featuredMedia[0])} className="homepage-dashboard__media-card">
                <DashboardThumb className="homepage-dashboard__media-cover" src={mediaThumbnail(featuredMedia[0])} alt={featuredMedia[0].title} />
                <strong>{featuredMedia[0].title}</strong>
                <p>{featuredMedia[0].speaker || featuredMedia[0].series || featuredMedia[0].media_type}</p>
              </Link> : <p className="homepage-dashboard__empty">Media will appear here.</p>}
              <div className="homepage-dashboard__mini-resources">
                {featuredPublications.slice(0, 2).map((item) => (
                  <Link key={item.id} to={publicationDetailPath(item)} className="homepage-dashboard__resource-item">
                    <DashboardThumb className="homepage-dashboard__resource-cover" src={publicationThumbnail(item)} alt={item.title} />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.publication_type || "Publication"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {featuredGiving.length ? (
        <section className="public-section featured-giving-section">
          <div className="section-head publications-list-head gospel-library-head featured-giving-section__head">
            <div>
              <p className="section-kicker">Featured Giving</p>
              <h2>Support current zonal needs</h2>
              <p className="lede">Stand with ongoing zonal projects, urgent support needs, and ministry initiatives making kingdom impact.</p>
            </div>
            <Link to="/give" className="public-btn ghost">View all giving</Link>
          </div>
          <div className="media-library-grid publications-grid-premium gospel-publications-grid">
            {featuredGiving.map((item) => (
              <FeaturedGivingCard key={item.id} item={item} to={`/give/${item.id}`} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="homepage-dual-cta">
        <div className="homepage-dual-cta__inner">
          <article className="homepage-dual-cta__card">
            <div className="homepage-dual-cta__icon">◎</div>
            <div className="homepage-dual-cta__copy">
              <h3>Get Connected, Get Involved.</h3>
              <p>There’s a place for you in DLCF South West. Find a fellowship near you and take your next step in your walk with Christ.</p>
            </div>
            <Link className="homepage-dual-cta__button" to="/states">Find a Fellowship</Link>
          </article>
          <article className="homepage-dual-cta__card">
            <div className="homepage-dual-cta__icon">❤</div>
            <div className="homepage-dual-cta__copy">
              <h3>Partner With Our Mission</h3>
              <p>Your partnership helps us reach more campuses and raise kingdom leaders across the South West.</p>
            </div>
            <Link className="homepage-dual-cta__button" to="/give">Give Now</Link>
          </article>
        </div>
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

      <section id="our-mentor" className="public-section mentor-section mentor-section--premium">
        <div className="mentor-grid mentor-grid--premium">
          <div className="mentor-media mentor-media--premium">
            <div className="mentor-frame mentor-frame--premium"><img src={mentorImage} alt="General Superintendent" /></div>
            <div className="mentor-caption">General Superintendent (GS)</div>
          </div>
          <div className="mentor-copy mentor-copy--premium">
            <p className="section-kicker">{content.mentor.label}</p>
            <h2>{content.mentor.title}</h2>
            <p>{stripHtml(content.mentor.body)}</p>
            {content.mentor.quote ? <p className="mentor-quote"><em>{content.mentor.quote}</em></p> : null}
          </div>
        </div>
      </section>

      <section id="cta" className="public-section callout callout--premium">
        <div className="callout__inner">
          <p className="section-kicker">{content.finalCta.label}</p>
          <h2>{content.finalCta.title}</h2>
          <p>{stripHtml(content.finalCta.body)}</p>
          <div className="public-cta-row callout__actions">
            <Link className="public-btn primary" to={content.finalCta.primaryUrl || "/states"}>{content.finalCta.primaryLabel || "Find Your State"}</Link>
            {content.finalCta.secondaryLabel ? <Link className="public-btn ghost" to={content.finalCta.secondaryUrl || "/media"}>{content.finalCta.secondaryLabel}</Link> : null}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
