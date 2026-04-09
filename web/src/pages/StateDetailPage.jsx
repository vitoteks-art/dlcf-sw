import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { apiFetch } from "../api";
import StatePublicHeader from "../components/StatePublicHeader";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const excerpt = (value, max = 140) => {
  const clean = stripHtml(value);
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
};

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function StateDetailPage({ stateSlug, states }) {
  const location = useLocation();
  const params = useParams();

  const stateId = stateSlug || params.stateId || location.pathname.split("/")[2];

  const [statePosts, setStatePosts] = useState([]);
  const [postsError, setPostsError] = useState("");
  const [homeContent, setHomeContent] = useState(null);
  const [publications, setPublications] = useState([]);
  const [publicationsError, setPublicationsError] = useState("");

  const resolvedStateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      const name = typeof state === "string" ? state : state?.name || state?.slug;
      return slugifyState(name) === stateId;
    });
    return typeof match === "string" ? match : match?.name || null;
  }, [stateId, states]);

  const stateSelector = resolvedStateName || stateId;

  useEffect(() => {
    if (!stateSelector) return;
    setPostsError("");
    apiFetch(`/public/states/${encodeURIComponent(stateSelector)}/posts`)
      .then((data) => setStatePosts(data.items || []))
      .catch((err) => setPostsError(err.message));

    apiFetch(`/public/state-home.php?slug=${encodeURIComponent(stateSelector)}`)
      .then((data) => setHomeContent(data.item || null))
      .catch(() => setHomeContent(null));
  }, [stateSelector]);

  useEffect(() => {
    setPublicationsError("");
    if (!resolvedStateName) {
      setPublications([]);
      return;
    }
    const query = new URLSearchParams();
    query.set("state", resolvedStateName);
    query.set("scope", "state");
    apiFetch(`/publication-items?${query.toString()}`)
      .then((data) => setPublications(data.items || []))
      .catch((err) => setPublicationsError(err.message));
  }, [resolvedStateName]);

  const formatStateName = (name) => {
    const n = String(name || "").trim();
    const m = n.match(/^(.+?)\s+State\s+\((.+)\)$/i);
    if (m) return `${m[1]} (${m[2]}) State`;
    const m2 = n.match(/^(.+?)\s+State\s+(\d+)$/i);
    if (m2) return `${m2[1]} (${m2[2]}) State`;
    return n;
  };

  const displayName = formatStateName(
    resolvedStateName || stateId.charAt(0).toUpperCase() + stateId.slice(1).replace("-", " ")
  );

  const quickFacts = useMemo(
    () => [
      {
        label: "State updates",
        value: statePosts.length > 0 ? String(statePosts.length).padStart(2, "0") : "Fresh",
        note: statePosts.length > 0 ? "recent stories" : "content hub",
      },
      {
        label: "Publications",
        value: publications.length > 0 ? String(publications.length).padStart(2, "0") : "Read",
        note: publications.length > 0 ? "faith resources" : "library ready",
      },
      {
        label: "Worship",
        value: contentLabel(homeContent?.worship?.title, "Join us"),
        note: "find fellowship",
      },
    ],
    [statePosts.length, publications.length, homeContent]
  );

  function contentLabel(value, fallback) {
    const clean = stripHtml(value || "");
    if (!clean) return fallback;
    return clean.length > 12 ? `${clean.slice(0, 12).trim()}…` : clean;
  }

  const content = useMemo(() => {
    const defaults = {
      hero: {
        title: `Welcome to DLCF ${displayName}`,
        subtitle: `Worship, fellowship, and spiritual growth in ${displayName}`,
        intro: `Connect with the brethren in ${displayName}, stay updated with state activities, and find the right place to worship and grow in the Word.`,
        ctaPrimary: "Find a Centre",
        ctaSecondary: "View Publications",
        backgroundImageUrl: "/hero-image.jpg",
      },
      about: {
        label: "Welcome",
        title: `About DLCF ${displayName}`,
        body: `DLCF ${displayName} exists to help people encounter Christ, grow in discipleship, and stay rooted in sound doctrine through worship, fellowship, and outreach.`,
        imageUrl: "",
      },
      worship: {
        label: "Connect",
        title: "Worship With Us",
        body: "Looking for a place to worship, connect, and grow? Explore fellowship opportunities, locate centres, and stay connected with the life of the ministry in this state.",
        primaryLabel: "Find a Centre",
        primaryUrl: "/states",
        secondaryLabel: "Contact State Team",
        secondaryUrl: "#state-contact",
        imageUrl: "",
        sideTitle: "Find fellowship opportunities",
        sideBody: `Use the state pages, updates, and contact details below to connect with the ministry in ${displayName}.`,
      },
      updates: {
        label: "Updates",
        title: "State Updates",
        body: `Follow recent updates, announcements, and ministry moments from ${displayName}.`,
      },
      eventsSection: {
        label: "Events",
        title: `Upcoming activities in ${displayName}`,
        body: "Stay informed about upcoming state programmes, meetings, and ministry events.",
      },
      gallerySection: {
        label: "Gallery",
        title: "Highlights from around the state",
        body: "Snapshots of worship, fellowship, and ministry moments across the state.",
      },
      publicationsSection: {
        label: "Gospel Publications",
        title: "Spiritual food and wisdom for the modern believer",
        body: "Read articles, devotionals, and faith-building publications for the state audience.",
        ctaLabel: "View All Articles →",
      },
      events: [{ title: "", date: "", time: "", type: "" }],
      gallery: [{ url: "", caption: "" }],
      contact: {
        label: "Contact",
        title: "Contact the State Team",
        body: `Reach out to the state team for enquiries, worship information, and fellowship guidance in ${displayName}.`,
        imageUrl: "",
        address: "",
        email: "",
        phone: "",
      },
      sections: [{ title: "", content: "" }],
    };

    return {
      ...defaults,
      ...(homeContent || {}),
      hero: { ...defaults.hero, ...((homeContent || {}).hero || {}) },
      about: { ...defaults.about, ...((homeContent || {}).about || {}) },
      worship: { ...defaults.worship, ...((homeContent || {}).worship || {}) },
      updates: { ...defaults.updates, ...((homeContent || {}).updates || {}) },
      eventsSection: { ...defaults.eventsSection, ...((homeContent || {}).eventsSection || {}) },
      gallerySection: { ...defaults.gallerySection, ...((homeContent || {}).gallerySection || {}) },
      publicationsSection: { ...defaults.publicationsSection, ...((homeContent || {}).publicationsSection || {}) },
      contact: { ...defaults.contact, ...((homeContent || {}).contact || {}) },
      events:
        Array.isArray((homeContent || {}).events) && (homeContent || {}).events.length > 0
          ? (homeContent || {}).events
          : defaults.events,
      gallery:
        Array.isArray((homeContent || {}).gallery) && (homeContent || {}).gallery.length > 0
          ? (homeContent || {}).gallery
          : defaults.gallery,
      sections:
        Array.isArray((homeContent || {}).sections) && (homeContent || {}).sections.length > 0
          ? (homeContent || {}).sections
          : defaults.sections,
    };
  }, [homeContent, displayName]);

  if (!stateId) return null;

  return (
    <div className="premium-state-page state-home-v2">
      <SEO title={`${displayName} State | DLCF`} description={`Welcome to DLCF ${displayName}. Join us for worship and discipleship.`} />
      <StatePublicHeader stateName={displayName} stateSlug={stateId} />

      <main className="state-home-main">
        <section className="state-hero-v2">
          <div
            className="state-hero-v2__bg"
            style={{ backgroundImage: `url(${content.hero.backgroundImageUrl || "https://images.unsplash.com/photo-1523803326055-9729b9e02e5f?auto=format&fit=crop&q=80&w=1600"})` }}
          />
          <div className="state-hero-v2__overlay" />
          <div className="container state-hero-v2__inner">
            <div className="state-hero-v2__copy">
              <span className="state-hero-v2__eyebrow">{content.hero.subtitle || `DLCF ${displayName}`}</span>
              <h1>{content.hero.title}</h1>
              <p className="state-hero-v2__intro">{stripHtml(content.hero.intro)}</p>
              <div className="state-hero-v2__actions">
                <Link to={content.worship.primaryUrl || "/states"} className="state-btn state-btn--primary">
                  {content.hero.ctaPrimary || "Find a Centre"}
                </Link>
                <Link to={`/${stateId}/publications`} className="state-btn state-btn--ghost">
                  {content.hero.ctaSecondary || "View Publications"}
                </Link>
              </div>
            </div>

            <div className="state-hero-v2__panel">
              <div className="state-hero-v2__panel-card">
                <span className="state-hero-v2__panel-label">State snapshot</span>
                <h3>{displayName}</h3>
                <p>{excerpt(content.about.body, 150) || `Connect with worship, updates, and ministry life in ${displayName}.`}</p>
              </div>
              <div className="state-hero-v2__facts">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="state-fact-card">
                    <span className="state-fact-card__value">{fact.value}</span>
                    <span className="state-fact-card__label">{fact.label}</span>
                    <small>{fact.note}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="state-section-v2 state-section-v2--intro">
          <div className="container state-two-column">
            <div className="state-copy-block">
              <span className="section-label">{content.about.label}</span>
              <h2>{content.about.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.about.body }} />
            </div>
            <div className="state-image-frame state-image-frame--tall">
              <img src={content.about.imageUrl || "https://placehold.co/900x700?text=State+Fellowship"} alt={`${displayName} fellowship`} />
            </div>
          </div>
        </section>

        <section className="state-section-v2 state-section-v2--soft">
          <div className="container state-two-column state-two-column--reverse-balance">
            <div className="state-highlight-card">
              <span className="section-label">{content.worship.label}</span>
              <h2>{content.worship.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.worship.body }} />
              <div className="state-inline-actions">
                <Link to={content.worship.primaryUrl || "/states"} className="state-btn state-btn--primary">
                  {content.worship.primaryLabel || "Find a Centre"}
                </Link>
                <Link to={content.worship.secondaryUrl || "#state-contact"} className="state-btn state-btn--outline">
                  {content.worship.secondaryLabel || "Contact State Team"}
                </Link>
              </div>
            </div>
            <div className="state-image-frame state-image-frame--overlay">
              <img src={content.worship.imageUrl || "https://placehold.co/900x900?text=State+Worship+Guide"} alt="Worship guide" />
              <div className="state-image-frame__overlayCard">
                <span className="state-image-frame__kicker">Connect</span>
                <h3>{content.worship.sideTitle}</h3>
                <p>{excerpt(content.worship.sideBody, 150)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="state-section-v2 state-section-v2--dark">
          <div className="container">
            <div className="state-section-head state-section-head--centered">
              <span className="section-label">{content.updates.label}</span>
              <h2>{content.updates.title}</h2>
              <p>{excerpt(content.updates.body, 180)}</p>
            </div>
            <div className="state-card-grid">
              {postsError ? <p className="status">{postsError}</p> : null}
              {statePosts.length === 0 ? (
                <div className="state-content-card state-content-card--empty" style={{ gridColumn: "1 / -1" }}>
                  <div className="state-content-card__body">
                    <span className="card-tag">No updates yet</span>
                    <h4>No state updates available</h4>
                    <p>State updates published for {displayName} will appear here.</p>
                  </div>
                </div>
              ) : (
                statePosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="state-content-card">
                    <div className="state-content-card__thumb">
                      <img src={post.feature_image_url || "https://placehold.co/700x450?text=State+Update"} alt={post.title} />
                    </div>
                    <div className="state-content-card__body">
                      <span className="card-tag">{post.type || "Update"}</span>
                      <h4>{post.title}</h4>
                      <p>{excerpt(post.excerpt || post.content || "", 120)}</p>
                      <Link to={`/${stateId}/updates/${post.slug || post.id}`} className="read-more">Read More</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="state-section-v2">
          <div className="container">
            <div className="state-section-head">
              <div>
                <span className="section-label">{content.publicationsSection.label}</span>
                <h2>{content.publicationsSection.title}</h2>
                <p>{excerpt(content.publicationsSection.body, 180)}</p>
              </div>
              <Link to={`/${stateId}/publications`} className="view-all">{content.publicationsSection.ctaLabel || "View All Articles →"}</Link>
            </div>
            <div className="state-card-grid">
              {publicationsError ? <p className="status">{publicationsError}</p> : null}
              {publications.length === 0 ? (
                <div className="state-content-card state-content-card--empty" style={{ gridColumn: "1 / -1" }}>
                  <div className="state-content-card__body">
                    <span className="card-tag">No publications yet</span>
                    <h4>Nothing published for this state</h4>
                    <p>When publications are published for {displayName}, they will appear here automatically.</p>
                    <Link to={`/${stateId}/publications`} className="read-more">View Library</Link>
                  </div>
                </div>
              ) : (
                publications.slice(0, 3).map((item) => (
                  <div key={item.id} className="state-content-card state-content-card--light">
                    <div className="state-content-card__thumb">
                      <img src={item.cover_image_url || "https://placehold.co/700x450?text=Publication"} alt={item.title} />
                    </div>
                    <div className="state-content-card__body">
                      <span className="card-tag">{item.publication_type || "Publication"}</span>
                      <h4>{item.title}</h4>
                      <p>{excerpt(item.description || "", 120)}</p>
                      <Link to={`/${stateId}/publications/${item.id}`} className="read-more">Read More</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {content.events.filter((event) => event.title || event.date || event.time || event.type).length > 0 ? (
          <section className="state-section-v2 state-section-v2--soft">
            <div className="container">
              <div className="state-section-head">
                <div>
                  <span className="section-label">{content.eventsSection.label}</span>
                  <h2>{content.eventsSection.title}</h2>
                  <p>{excerpt(content.eventsSection.body, 180)}</p>
                </div>
              </div>
              <div className="state-event-grid">
                {content.events.filter((event) => event.title || event.date || event.time || event.type).map((event, idx) => (
                  <div key={`event-card-${idx}`} className="state-event-card">
                    <span className="card-tag">{event.type || "Event"}</span>
                    <h4>{event.title || "Upcoming event"}</h4>
                    <p>{[event.date, event.time].filter(Boolean).join(" • ") || "Date to be announced"}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {content.gallery.filter((item) => item.url).length > 0 ? (
          <section className="state-section-v2">
            <div className="container">
              <div className="state-section-head">
                <div>
                  <span className="section-label">{content.gallerySection.label}</span>
                  <h2>{content.gallerySection.title}</h2>
                  <p>{excerpt(content.gallerySection.body, 180)}</p>
                </div>
              </div>
              <div className="state-gallery-grid">
                {content.gallery.filter((item) => item.url).map((item, idx) => (
                  <div key={`gallery-${idx}`} className="state-gallery-card">
                    <img src={item.url} alt={item.caption || `Gallery ${idx + 1}`} />
                    <div className="state-gallery-card__caption">
                      <p>{item.caption || "State ministry highlight"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {content.sections.filter((section) => section.title || section.content).length > 0 ? (
          <section className="state-section-v2 state-section-v2--soft">
            <div className="container state-custom-sections">
              {content.sections.filter((section) => section.title || section.content).map((section, idx) => (
                <div key={`section-${idx}`} className="state-custom-card">
                  {section.title ? <h3>{section.title}</h3> : null}
                  {section.content ? <div dangerouslySetInnerHTML={{ __html: section.content }} /> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="state-contact" className="state-section-v2 state-section-v2--contact">
          <div className="container state-two-column">
            <div className="state-contact-card">
              <span className="section-label">{content.contact.label}</span>
              <h2>{content.contact.title || `Reach DLCF ${displayName}`}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.contact.body }} />
              <div className="state-contact-list">
                {content.contact.address ? <p><strong>Address:</strong> {content.contact.address}</p> : null}
                {content.contact.email ? <p><strong>Email:</strong> {content.contact.email}</p> : null}
                {content.contact.phone ? <p><strong>Phone:</strong> {content.contact.phone}</p> : null}
                {!content.contact.address && !content.contact.email && !content.contact.phone ? (
                  <p>Contact details for {displayName} will appear here once updated by the state team.</p>
                ) : null}
              </div>
            </div>
            <div className="state-image-frame state-image-frame--contact">
              <img src={content.contact.imageUrl || "https://placehold.co/900x700?text=Contact+State+Team"} alt="Contact state team" />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
