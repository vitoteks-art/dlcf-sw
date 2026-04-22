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

const mergeWithNonEmpty = (defaults, incoming) => {
  const next = { ...defaults };
  const source = incoming || {};
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (typeof value === "string") {
      if (value.trim() !== "") next[key] = value;
      return;
    }
    if (value !== undefined && value !== null) {
      next[key] = value;
    }
  });
  return next;
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

const recurringDayLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Weekly";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
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
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState("");
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
    apiFetch(`/public/state-events.php?slug=${encodeURIComponent(stateSelector)}`)
      .then((data) => setStatePosts(data.items || []))
      .catch((err) => setPostsError(err.message));

    apiFetch(`/public/state-home.php?slug=${encodeURIComponent(stateSelector)}`)
      .then((data) => setHomeContent(data.item || null))
      .catch(() => setHomeContent(null));
  }, [stateSelector]);

  useEffect(() => {
    setMediaError("");
    if (!resolvedStateName) {
      setMediaItems([]);
      return;
    }
    const query = new URLSearchParams();
    query.set("state", resolvedStateName);
    query.set("scope", "state");
    apiFetch(`/media-items?${query.toString()}`)
      .then((data) => setMediaItems(data.items || []))
      .catch((err) => setMediaError(err.message));
  }, [resolvedStateName]);

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
      leadership: {
        label: "Our Leadership",
        title: "Godly Guidance",
        body: `Meet the visionary leaders committed to the spiritual and academic excellence of students across ${displayName}.`,
        members: [
          {
            name: "Pastor W.F. Kumuyi",
            role: "General Superintendent",
            quote: "Raise a generation of students who excel in learning and shine in character, reflecting the glory of God in all they do.",
            imageUrl: "",
          },
          {
            name: "Zonal Coordinator",
            role: "Zonal Coordinator",
            quote: `Providing direction, spiritual oversight, and coordinated support for campus fellowship growth across ${displayName}.`,
            imageUrl: "",
          },
          {
            name: "State Coordinator",
            role: "State Coordinator",
            quote: `Committed to the total transformation of every youth in ${displayName} through the power of the Word and persistent prayer.`,
            imageUrl: "",
          },
        ],
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
      hero: mergeWithNonEmpty(defaults.hero, (homeContent || {}).hero),
      about: mergeWithNonEmpty(defaults.about, (homeContent || {}).about),
      leadership: {
        ...defaults.leadership,
        ...((homeContent || {}).leadership || {}),
        members:
          Array.isArray((homeContent || {}).leadership?.members) && (homeContent || {}).leadership.members.length > 0
            ? (homeContent || {}).leadership.members.map((member, idx) => ({
                ...defaults.leadership.members[Math.min(idx, defaults.leadership.members.length - 1)],
                ...(member || {}),
              }))
            : defaults.leadership.members,
      },
      worship: mergeWithNonEmpty(defaults.worship, (homeContent || {}).worship),
      updates: mergeWithNonEmpty(defaults.updates, (homeContent || {}).updates),
      eventsSection: mergeWithNonEmpty(defaults.eventsSection, (homeContent || {}).eventsSection),
      gallerySection: mergeWithNonEmpty(defaults.gallerySection, (homeContent || {}).gallerySection),
      publicationsSection: mergeWithNonEmpty(defaults.publicationsSection, (homeContent || {}).publicationsSection),
      contact: mergeWithNonEmpty(defaults.contact, (homeContent || {}).contact),
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
    const eventPosts = items.filter(
      (post) =>
        post.recurrence_mode === "weekly" ||
        post.event_start_date ||
        post.event_end_date ||
        /event|conference|revival|programme|program|crusade|retreat|bible\s*study|worship|koinonia/i.test(String(post.type || ""))
    );
    if (eventPosts.length > 0) {
      return eventPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title || "Upcoming event",
        date:
          post.recurrence_mode === "weekly"
            ? `${recurringDayLabel(post.recurrence_day_of_week)} (Weekly)`
            : formatEventDate(post.event_start_date, post.event_end_date),
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
  const aboutLabel = String(homeContent?.about?.label || content.about.label || "").trim() || "Who We Are";
  const aboutTitle = String(homeContent?.about?.title || content.about.title || "").trim() || `Rooted in Grace, Driven by Purpose in ${displayName}`;
  const aboutBody = String(homeContent?.about?.body || content.about.body || "").trim() || `Deeper Life Campus Fellowship ${displayName} is part of a vibrant ministry committed to building godly students and youths through the Word of God, prayer, holy living, and practical discipleship.`;
  const aboutImage = normalizeImageUrl(homeContent?.about?.imageUrl || content.about.imageUrl, heroImageUrl || "https://placehold.co/900x700?text=About+State");
  const leadershipLabel = String(content.leadership?.label || "").trim() || "Our Leadership";
  const leadershipTitle = String(content.leadership?.title || "").trim() || "Godly Guidance";
  const leadershipBody = stripHtml(content.leadership?.body || "") || `Meet the visionary leaders committed to the spiritual and academic excellence of students across ${displayName}.`;
  const leadershipMembers = (Array.isArray(content.leadership?.members) ? content.leadership.members : [])
    .filter((member) => member?.name || member?.role || member?.quote || member?.imageUrl)
    .slice(0, 3);
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
                <Link to={`/${stateId}/fellowships`} className="state-ref-btn state-ref-btn--primary">
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
              <span className="section-label">{aboutLabel}</span>
              <h2>{aboutTitle}</h2>
              <p>{stripHtml(aboutBody)}</p>
            </div>
            <div className="state-ref-bento__image" style={{ marginBottom: "2rem" }}>
              <div className="state-ref-hero__imageCard" style={{ maxWidth: "520px", margin: "0 auto" }}>
                <img
                  src={aboutImage}
                  alt={`${displayName} about section`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="state-ref-section state-ref-section--white">
          <div className="container">
            <div className="state-ref-sectionHead state-ref-sectionHead--center">
              <div>
                <span className="section-label">{leadershipLabel}</span>
                <h2>{leadershipTitle}</h2>
                <p>{leadershipBody}</p>
              </div>
            </div>
            <div className="state-ref-leadershipGrid">
              {(leadershipMembers.length ? leadershipMembers : content.leadership.members).slice(0, 3).map((member, idx) => (
                <article key={`leader-${idx}`} className="state-ref-leadershipCard">
                  <div className="state-ref-leadershipCard__imageWrap">
                    <img
                      src={normalizeImageUrl(member.imageUrl || "", `https://placehold.co/700x820?text=${encodeURIComponent(member.name || member.role || `Leader ${idx + 1}`)}`)}
                      alt={member.name || member.role || `Leader ${idx + 1}`}
                    />
                  </div>
                  <div className="state-ref-leadershipCard__body">
                    <h3>{member.name || `Leader ${idx + 1}`}</h3>
                    <p className="state-ref-leadershipCard__role">{member.role || "Leadership"}</p>
                    <blockquote>{stripHtml(member.quote || "")}</blockquote>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="state-ref-section">
          <div className="container">
            <div className="state-ref-actionsGrid">
              <Link to={`/${stateId}/fellowships`} className="state-ref-actionCard">
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
              <Link to={`/${stateId}/events`} className="state-ref-moreLink">View All Events</Link>
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
                    <Link to={event.slug ? `/${stateId}/events/${event.slug}` : `/${stateId}/events`}>View Details</Link>
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
              {(mediaItems.length ? mediaItems : [{ id: "placeholder-1", title: "Walking in Divine Purpose", description: "Recent teachings and messages will appear here.", media_type: "audio" }, { id: "placeholder-2", title: "The Power of Intercession", description: "Watch the latest state convergence messages.", media_type: "video" }, { id: "placeholder-3", title: "Leading with Integrity", description: "Messages on leadership and spiritual growth.", media_type: "audio" }]).slice(0, 3).map((item) => (
                <article key={item.id} className="state-ref-messageCard">
                  <div className="state-ref-messageCard__thumb">
                    <img src={normalizeImageUrl(item.thumbnail_url || "", aboutImageUrl || "https://placehold.co/700x450?text=Message")} alt={item.title} />
                    <div className="state-ref-messageCard__play">
                      <span className="material-symbols-outlined">play_circle</span>
                    </div>
                  </div>
                  <div className="state-ref-messageCard__body">
                    <p>{item.media_type || "Recent Message"}</p>
                    <h4>{item.title}</h4>
                    <Link to={item.id?.toString().startsWith("placeholder") ? `/${stateId}/media` : `/${stateId}/media/${item.id}`}>
                      Watch Now
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            {mediaError ? <p className="status">{mediaError}</p> : null}
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
