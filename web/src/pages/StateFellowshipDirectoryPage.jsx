import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import StatePublicHeader from "../components/StatePublicHeader";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatStateName = (name) => {
  const n = String(name || "").trim();
  const m = n.match(/^(.+?)\s+State\s+\((.+)\)$/i);
  if (m) return `${m[1]} (${m[2]}) State`;
  const m2 = n.match(/^(.+?)\s+State\s+(\d+)$/i);
  if (m2) return `${m2[1]} (${m2[2]}) State`;
  return n;
};

const inferType = (name) => {
  const value = String(name || "").toLowerCase();
  if (/(university|polytechnic|college|campus|institute|federal school|school)/i.test(value)) {
    return "Campus Centre";
  }
  return "Town Fellowship";
};

const iconForType = (type) => {
  if (type === "Campus Centre") return "school";
  return "church";
};

const buildDescription = (item, displayName) => {
  const saved = String(item.description || "").trim();
  if (saved) return saved;
  const type = inferType(item.name);
  if (type === "Campus Centre") {
    return `A vibrant campus fellowship in ${item.region || displayName}, helping students grow in the Word, prayer, and practical discipleship.`;
  }
  return `A welcoming fellowship centre serving brethren and visitors in ${item.region || displayName}, with sound teaching and warm community life.`;
};

const buildLocation = (item, displayName) => {
  const savedAddress = String(item.address || "").trim();
  if (savedAddress) return savedAddress;
  const region = String(item.region || "").trim();
  const state = String(item.state || displayName || "").trim();
  if (region && state) return `${region}, ${state}`;
  return region || state || "Location to be announced";
};

const buildMeetingTime = (item) => {
  const type = inferType(item.name);
  if (type === "Campus Centre") return "Sundays and midweek Bible study";
  return "Weekly worship and fellowship meetings";
};

export default function StateFellowshipDirectoryPage({ stateSlug, states }) {
  const location = useLocation();
  const params = useParams();
  const currentStateSlug = stateSlug || params.stateId || location.pathname.split("/")[1] || "";
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolvedStateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      const name = typeof state === "string" ? state : state?.name || state?.slug;
      return slugifyState(name) === currentStateSlug;
    });
    return typeof match === "string" ? match : match?.name || null;
  }, [currentStateSlug, states]);

  const displayName = formatStateName(
    resolvedStateName || currentStateSlug.charAt(0).toUpperCase() + currentStateSlug.slice(1).replace(/-/g, " ")
  );

  useEffect(() => {
    if (!resolvedStateName) return;
    setLoading(true);
    setError("");
    apiFetch(`/meta/fellowships?state=${encodeURIComponent(resolvedStateName)}&rich=1`)
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch((err) => {
        setItems([]);
        setError(err.message || "Unable to load fellowship directory right now.");
      })
      .finally(() => setLoading(false));
  }, [resolvedStateName]);

  const normalizedItems = useMemo(() => {
    return items
      .map((item, index) => {
        const type = inferType(item.name);
        return {
          ...item,
          type,
          icon: iconForType(type),
          description: buildDescription(item, displayName),
          locationLabel: buildLocation(item, displayName),
          meetingTime: buildMeetingTime(item),
          highlight: index === 2,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, displayName]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedItems;
    return normalizedItems.filter((item) => {
      const haystack = [item.name, item.region, item.state, item.locationLabel, item.type, item.description]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [normalizedItems, query]);

  const activeCount = filteredItems.length || normalizedItems.length;

  return (
    <div className="state-directory-page">
      <SEO
        title={`Fellowship Directory | ${displayName}`}
        description={`Discover fellowship centres, campus fellowships, and community worship locations across ${displayName}.`}
      />
      <StatePublicHeader stateName={displayName} stateSlug={currentStateSlug} />

      <main className="state-directory-main">
        <section className="state-directory-hero container">
          <div className="state-directory-hero__copy">
            <span className="state-directory-kicker">Find Your Community</span>
            <h1>
              Fellowship <br />
              <span>Directory</span>
            </h1>
            <p>
              Discover a home away from home. Connect with vibrant campus fellowships and town centres across {displayName}.
            </p>
          </div>
          <div className="state-directory-searchWrap">
            <div className="state-directory-search">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by school or town..."
              />
            </div>
          </div>
        </section>

        <section className="state-directory-spotlight container">
          <div className="state-directory-spotlight__visual">
            <div className="state-directory-spotlight__overlay" />
            <div className="state-directory-spotlight__pill">
              <span className="state-directory-spotlight__dot" />
              <p>Showing {activeCount} Active Fellowships in {displayName}</p>
            </div>
          </div>
        </section>

        <section className="state-directory-gridSection container">
          {loading ? (
            <div className="state-directory-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <article key={`skeleton-${idx}`} className="state-directory-card state-directory-card--skeleton">
                  <div className="state-directory-skeleton state-directory-skeleton--icon" />
                  <div className="state-directory-skeleton state-directory-skeleton--title" />
                  <div className="state-directory-skeleton state-directory-skeleton--line" />
                  <div className="state-directory-skeleton state-directory-skeleton--line short" />
                  <div className="state-directory-skeleton state-directory-skeleton--button" />
                </article>
              ))}
            </div>
          ) : error ? (
            <div className="state-directory-status state-directory-status--error">
              <h3>Unable to load fellowships right now</h3>
              <p>{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="state-directory-status">
              <h3>No fellowship found yet</h3>
              <p>Try another school, city, or area. Nearby fellowship centres will appear when available.</p>
            </div>
          ) : (
            <div className="state-directory-grid">
              {filteredItems.map((item, idx) => (
                <article
                  key={item.id || `${item.name}-${idx}`}
                  className={`state-directory-card ${item.highlight ? "state-directory-card--highlight" : ""}`}
                >
                  <div className="state-directory-card__top">
                    <div className="state-directory-card__icon">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className={`state-directory-card__badge ${item.type === "Campus Centre" ? "campus" : "town"}`}>
                      {item.type}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="state-directory-card__desc">{item.description}</p>
                  <div className="state-directory-card__meta">
                    <div>
                      <span className="material-symbols-outlined">location_on</span>
                      <span>{item.locationLabel}</span>
                    </div>
                    <div>
                      <span className="material-symbols-outlined">calendar_month</span>
                      <span>{item.meetingTime}</span>
                    </div>
                  </div>
                  <div className="state-directory-card__footer">
                    <Link to={`/${currentStateSlug}`} className="state-directory-card__button">
                      <span>View State</span>
                      <span className="material-symbols-outlined">arrow_outward</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
