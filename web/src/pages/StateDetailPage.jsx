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

const formatEventDate = (startDate, endDate) => {
  const start = String(startDate || "").trim();
  const end = String(endDate || "").trim();
  if (!start && !end) return "Soon";
  const formatOne = (value) => {
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };
  if (start && end && start !== end) {
    return `${formatOne(start)} - ${formatOne(end)}`;
  }
  return formatOne(start || end);
};

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
  const [communityQuery, setCommunityQuery] = useState("");
  const [communityCenters, setCommunityCenters] = useState([]);

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

  useEffect(() => {
    if (!resolvedStateName) {
      setCommunityCenters([]);
      return;
    }
    const query = new URLSearchParams();
    query.set("state", resolvedStateName);
    apiFetch(`/meta/fellowships?${query.toString()}`)
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        setCommunityCenters(items.map((name) => ({ name })));
      })
      .catch(() => setCommunityCenters([]));
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

  const content = useMemo(() => {
    const defaults = {
      hero: {
        title: `Welcome to DLCF ${displayName}`,
        subtitle: "Welcome Home",
        intro: `Connect with the brethren in ${displayName}, stay updated with state activities, and find the right place to worship and grow in the Word.`,
        ctaPrimary: "Join a Fellowship",
        ctaSecondary: "Watch Messages",
        backgroundImageUrl: "/hero-image.jpg",
      },
      about: {
        label: "Who We Are",
        title: "Rooted in Grace, Driven by Purpose",
        body: `DLCF ${displayName} exists to help people encounter Christ, grow in discipleship, and stay rooted in sound doctrine through worship, fellowship, and outreach.`,
        imageUrl: "",
      },
      worship: {
        label: "Find Your Community",
        title: "Find a Fellowship Centre",
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
        label: "Recent Messages",
        title: "Spiritual Nourishment",
        body: `Rewatch our most recent teachings and stay transformed by the power of the Word in ${displayName}.`,
      },
      eventsSection: {
        label: "Events",
        title: "Sacred Gatherings",
        body: "Mark your calendar for upcoming revival meetings, Bible studies, and ministry programmes.",
      },
      gallerySection: {
        label: "Gallery",
        title: "State Fellowship Highlights",
        body: "Snapshots of worship, fellowship, and ministry moments across the state.",
      },
      publicationsSection: {
        label: "Resources",
        title: "Faith Resources & Publications",
        body: "Read articles, devotionals, and faith-building publications for the state audience.",
        ctaLabel: "View All Resources →",
      },
      events: [{ title: "", date: "", time: "", type: "" }],
      gallery: [{ url: "", caption: "" }],
      contact: {
        label: "Reach Out",
        title: "Need Prayer or Spiritual Counseling?",
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

  const validEvents = content.events.filter((event) => event.title || event.date || event.time || event.type);
  const homepageEvents = useMemo(() => {
    const items = Array.isArray(statePosts) ? statePosts : [];
    const eventPosts = items.filter((post) => post.event_start_date || post.event_end_date || /event|conference|revival|programme|program|crusade|retreat/i.test(String(post.type || "")));
    if (eventPosts.length > 0) {
      return eventPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title || "Upcoming event",
        date: formatEventDate(post.event_start_date, post.event_end_date),
        time: post.event_time_label || "Time TBA",
        type: post.type || "Programme",
        image: post.feature_image_url || "",
      }));
    }
    return validEvents;
  }, [statePosts, validEvents]);
  const validGallery = content.gallery.filter((item) => item.url);
  const validSections = content.sections.filter((section) => section.title || section.content);

  const suggestedCenters = useMemo(
    () => communityCenters.slice(0, 2).map((item) => ({ center: item.name, region: "Suggested centre" })),
    [communityCenters]
  );

  const communityResults = useMemo(() => {
    if (!communityCenters.length) return [];
    const q = communityQuery.trim().toLowerCase();
    if (!q) return [];

    const exact = communityCenters
      .filter(({ name }) => String(name || "").toLowerCase().includes(q))
      .map((item) => ({ center: item.name, region: "Fellowship Centre" }));
    if (exact.length > 0) return exact.slice(0, 8);

    const tokens = q.split(/\s+/).filter(Boolean);
    const nearby = communityCenters
      .filter(({ name }) => {
        const hay = String(name || "").toLowerCase();
        return tokens.some((token) => hay.includes(token.slice(0, Math.max(3, token.length - 1))));
      })
      .map((item) => ({ center: item.name, region: "Nearby match" }));
    return nearby.slice(0, 8);
  }, [communityCenters, communityQuery]);

  const heroImageUrl = normalizeImageUrl(content.hero.backgroundImageUrl || homeContent?.hero?.backgroundImageUrl, normalizeImageUrl("/hero-image.jpg"));
  const aboutImageUrl = normalizeImageUrl(content.about.imageUrl, heroImageUrl || "https://placehold.co/900x700?text=State+Fellowship");
  const contactImageUrl = normalizeImageUrl(content.contact.imageUrl, aboutImageUrl || "https://placehold.co/900x700?text=Contact+State+Team");
  const firstGalleryImageUrl = normalizeImageUrl(validGallery[0]?.url || "", aboutImageUrl || heroImageUrl);
  const communityMapQuery = encodeURIComponent(`${displayName}, Nigeria`);
  const communityMapUrl = `https://www.google.com/maps?q=${communityMapQuery}&z=9&output=embed`;

  if (!stateId) return null;

  return (
    <div className="premium-state-page state-home-reference">
      <SEO title={`${displayName} State | DLCF`} description={`Welcome to DLCF ${displayName}. Join us for worship and discipleship.`} />
      <StatePublicHeader stateName={displayName} stateSlug={stateId} />

      <main className="state-reference-main">
        <section className="state-ref-hero">
          <div className="container state-ref-hero__grid">
            <div className="state-ref-hero__copy">
              <span className="state-ref-badge">{content.hero.subtitle || homeContent?.hero?.subtitle || "Welcome Home"}</span>
              <h1>
                {content.hero.title || homeContent?.hero?.title || `Welcome to DLCF ${displayName}`}
              </h1>
              <p>{stripHtml(content.hero.intro)}</p>
              <div className="state-ref-actions">
                <Link to={content.worship.primaryUrl || "/states"} className="state-ref-btn state-ref-btn--primary">
                  {content.hero.ctaPrimary || "Join a Fellowship"}
                </Link>
                <Link to={`/${stateId}/media`} className="state-ref-btn state-ref-btn--secondary">
                  {content.hero.ctaSecondary || "Watch Messages"}
                </Link>
              </div>
            </div>
            <div className="state-ref-hero__mediaWrap">
              <div className="state-ref-hero__glow" />
              <div className="state-ref-hero__imageCard">
                <img
                  src={heroImageUrl || aboutImageUrl || "https://placehold.co/900x1100?text=State+Fellowship"}
                  alt={`${displayName} fellowship`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="state-ref-section state-ref-section--soft">
          <div className="container state-ref-bento">
            <div className="state-ref-bento__intro">
              <span className="section-label">Who We Are</span>
              <h2>{`Rooted in Grace, Driven by Purpose in ${displayName}`}</h2>
              <p>
                {`Deeper Life Campus Fellowship ${displayName} is part of a vibrant ministry committed to building godly students and youths through the Word of God, prayer, holy living, and practical discipleship.`}
              </p>
            </div>
            <div className="state-ref-bento__cards">
              <article className="state-ref-infoCard state-ref-infoCard--primary">
                <span className="material-symbols-outlined">auto_awesome</span>
                <h3>Who We Are</h3>
                <p>
                  We are a Bible-believing community raising spiritually vibrant, disciplined, and purpose-driven students and young people for Christ.
                </p>
              </article>
              <article className="state-ref-infoCard state-ref-infoCard--accent">
                <span className="material-symbols-outlined">rocket_launch</span>
                <h3>Our Mission</h3>
                <p>
                  To win souls, build believers in sound doctrine, and send forth godly leaders who will shine for Christ in every sphere of life.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="state-ref-section">
          <div className="container">
            <div className="state-ref-actionsGrid">
              <Link to={content.worship.primaryUrl || "/states"} className="state-ref-actionCard">
                <span className="material-symbols-outlined">location_on</span>
                <h4>Find a Center</h4>
                <p>Locate the nearest DLCF center near your campus.</p>
              </Link>
              <Link to="#state-events" className="state-ref-actionCard">
                <span className="material-symbols-outlined">event</span>
                <h4>Upcoming Programs</h4>
                <p>Stay updated with our state and campus activities.</p>
              </Link>
              <Link to="#state-contact" className="state-ref-actionCard">
                <span className="material-symbols-outlined">support_agent</span>
                <h4>Prayer Request</h4>
                <p>Let us stand in faith with you and support your journey.</p>
              </Link>
              <Link to={`/${stateId}/media`} className="state-ref-actionCard">
                <span className="material-symbols-outlined">video_library</span>
                <h4>Recent Messages</h4>
                <p>Access life-changing sermons and Bible studies.</p>
              </Link>
            </div>
          </div>
        </section>

        <section id="state-events" className="state-ref-section state-ref-section--white">
          <div className="container">
            <div className="state-ref-sectionHead">
              <div>
                <h2>{content.eventsSection.title}</h2>
                <p>{content.eventsSection.body}</p>
              </div>
              <Link to={`/${stateId}/updates`} className="state-ref-moreLink">View All Events</Link>
            </div>
            <div className="state-ref-eventGrid">
              {(homepageEvents.length ? homepageEvents : [{ title: "Upcoming State Programme", date: "Date to be announced", time: "", type: "Event" }]).slice(0, 3).map((event, idx) => (
                <article key={`event-${idx}`} className="state-ref-eventCard">
                  <div className="state-ref-eventCard__image">
                    <img
                      src={normalizeImageUrl(event.image || validGallery[idx]?.url || "", aboutImageUrl || "https://placehold.co/800x500?text=Event")}
                      alt={event.title || "Event"}
                    />
                    <div className="state-ref-eventDate">{event.date || "Soon"}</div>
                  </div>
                  <div className="state-ref-eventCard__body">
                    <h3>{event.title || "Upcoming event"}</h3>
                    <div className="state-ref-eventMeta">
                      <span>{event.time || "Time TBA"}</span>
                      <span>{event.type || "Programme"}</span>
                    </div>
                    <button type="button">View Details</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="state-ref-section state-ref-section--darkBand">
          <div className="container state-ref-community">
            <div className="state-ref-community__copy">
              <h2>{content.worship.title || "Find Your Community"}</h2>
              <p>{excerpt(content.worship.body, 220)}</p>
              <div className="state-ref-searchBox">
                <input
                  type="text"
                  value={communityQuery}
                  onChange={(e) => setCommunityQuery(e.target.value)}
                  placeholder={`Search by school or city in ${displayName}`}
                />
                <span className="material-symbols-outlined">search</span>
              </div>
              <div className="state-ref-communityList">
                {communityQuery.trim() ? (
                  communityResults.length > 0 ? communityResults.map(({ region, center }, idx) => (
                    <div key={`${region}-${center}-${idx}`} className="state-ref-communityItem">
                      <div>
                        <h5>{center}</h5>
                        <p>{region}, {displayName}</p>
                      </div>
                      <span className="material-symbols-outlined">directions</span>
                    </div>
                  )) : (
                    <div className="state-ref-communityItem">
                      <div>
                        <h5>No exact center found</h5>
                        <p>Try another school, city, or area. Nearby fellowship centres will appear when available.</p>
                      </div>
                      <span className="material-symbols-outlined">travel_explore</span>
                    </div>
                  )
                ) : (
                  <>
                    <div className="state-ref-communityHint">
                      Search for your fellowship centre by school, city, or area.
                    </div>
                    {suggestedCenters.map(({ region, center }, idx) => (
                      <div key={`${region}-${center}-${idx}`} className="state-ref-communityItem">
                        <div>
                          <h5>{center}</h5>
                          <p>{region}, {displayName}</p>
                        </div>
                        <span className="material-symbols-outlined">place</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="state-ref-community__map state-ref-community__map--card">
              <iframe
                title={`${displayName} map`}
                src={communityMapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="state-ref-section">
          <div className="container">
            <div className="state-ref-sectionHead state-ref-sectionHead--center">
              <div>
                <h2>{content.updates.title}</h2>
                <p>{content.updates.body}</p>
              </div>
            </div>
            <div className="state-ref-messageGrid">
              {(statePosts.length ? statePosts : [{ id: "placeholder-1", title: "Walking in Divine Purpose", excerpt: "Recent teachings and messages will appear here.", type: "Weekly Bible Study" }, { id: "placeholder-2", title: "The Power of Intercession", excerpt: "Watch the latest state convergence messages.", type: "State Convergence" }, { id: "placeholder-3", title: "Leading with Integrity", excerpt: "Messages on leadership and spiritual growth.", type: "Leadership Summit" }]).slice(0, 3).map((post) => (
                <article key={post.id} className="state-ref-messageCard">
                  <div className="state-ref-messageCard__thumb">
                    <img src={normalizeImageUrl(post.feature_image_url || "", aboutImageUrl || "https://placehold.co/700x450?text=Message")} alt={post.title} />
                    <div className="state-ref-messageCard__play">
                      <span className="material-symbols-outlined">play_circle</span>
                    </div>
                  </div>
                  <div className="state-ref-messageCard__body">
                    <p>{post.type || "Recent Message"}</p>
                    <h4>{post.title}</h4>
                    <Link to={post.id?.toString().startsWith("placeholder") ? `/${stateId}/media` : `/${stateId}/updates/${post.slug || post.id}`}>
                      Watch Now
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="state-ref-section state-ref-section--soft">
          <div className="container">
            <div className="state-ref-sectionHead state-ref-sectionHead--center">
              <div>
                <h2>{content.publicationsSection.title}</h2>
                <p>{content.publicationsSection.body}</p>
              </div>
            </div>
            <div className="state-ref-resourceGrid">
              {(publications.length ? publications : [{ id: "resource-1", title: "Daily Devotional", description: "Spirit-filled publications for your growth.", publication_type: "Devotional" }, { id: "resource-2", title: "Bible Study Notes", description: "Sound doctrine and practical Christian living.", publication_type: "Study" }, { id: "resource-3", title: "Campus Revival Bulletin", description: "Faith-building content for students and youths.", publication_type: "Bulletin" }]).slice(0, 3).map((item) => (
                <article key={item.id} className="state-ref-resourceCard">
                  <div className="state-ref-resourceCard__thumb">
                    <img src={normalizeImageUrl(item.cover_image_url || "", firstGalleryImageUrl || "https://placehold.co/700x450?text=Resource")} alt={item.title} />
                  </div>
                  <div className="state-ref-resourceCard__body">
                    <span>{item.publication_type || "Publication"}</span>
                    <h4>{item.title}</h4>
                    <p>{excerpt(item.description || "", 120)}</p>
                    <Link to={item.id?.toString().startsWith("resource-") ? `/${stateId}/publications` : `/${stateId}/publications/${item.id}`}>
                      Read More
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {(validGallery.length > 0 || validSections.length > 0) ? (
          <section className="state-ref-section state-ref-section--white">
            <div className="container">
              <div className="state-ref-sectionHead state-ref-sectionHead--center">
                <div>
                  <h2>{content.gallerySection.title}</h2>
                  <p>{content.gallerySection.body}</p>
                </div>
              </div>
              <div className="state-ref-galleryGrid">
                {validGallery.slice(0, 4).map((item, idx) => (
                  <article key={`gallery-${idx}`} className="state-ref-galleryCard">
                    <img src={normalizeImageUrl(item.url, firstGalleryImageUrl || "https://placehold.co/700x450?text=Gallery")} alt={item.caption || `Gallery ${idx + 1}`} />
                    <div className="state-ref-galleryCard__caption">{item.caption || "State ministry highlight"}</div>
                  </article>
                ))}
                {validSections.slice(0, Math.max(0, 4 - validGallery.length)).map((section, idx) => (
                  <article key={`section-${idx}`} className="state-ref-galleryCard state-ref-galleryCard--text">
                    <h3>{section.title || "State Highlight"}</h3>
                    <p>{excerpt(section.content, 160)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="state-contact" className="state-ref-ctaBand">
          <div className="container state-ref-ctaBand__inner">
            <div>
              <h2>Need Prayer or Spiritual Counseling?</h2>
              <p>Our ministers are available to pray with you, counsel you from the Word of God, and help you stay strong in faith.</p>
            </div>
            <a href="mailto:info@dlcfsw.org.ng" className="state-ref-btn state-ref-btn--cta">
              Reach Out Today
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
