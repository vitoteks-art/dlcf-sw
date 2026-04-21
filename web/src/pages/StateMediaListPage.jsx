import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatePublicHeader from "../components/StatePublicHeader";
import PublicFooter from "../components/PublicFooter";
import { apiFetch } from "../api";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fmtDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getStateDisplayName = (stateSlug, resolvedStateName) => {
  if (resolvedStateName) return resolvedStateName;
  return stateSlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const deriveCategory = (item) => {
  const tags = String(item?.tags || "")
    .split(",")
    .map((tag) => normalizeText(tag))
    .filter(Boolean);
  const series = normalizeText(item?.series);
  const title = normalizeText(item?.title);
  const description = normalizeText(item?.description);
  const speaker = normalizeText(item?.speaker);
  const haystack = [series, title, description, speaker, ...tags].join(" ");

  if (/conference|convention|summit|retreat|congress/.test(haystack)) return "Conferences";
  if (/outreach|mission|evangel|rural|crusade/.test(haystack)) return "Outreach";
  if (/worship|praise|prayer|revival/.test(haystack)) return "Worship";
  if (/fellowship|campus|students|meeting/.test(haystack)) return "Fellowship";
  if (item?.media_type === "audio") return "Audio";
  if (item?.media_type === "video") return "Video";
  return "Moments";
};

const buildGalleryItems = (items, displayName) => {
  const mediaCards = items.map((item) => ({
    kind: "media",
    item,
    category: deriveCategory(item),
  }));

  if (mediaCards.length < 3) return mediaCards;

  const quoteCard = {
    kind: "quote",
    id: "state-gallery-quote-card",
    quote: "Where hearts gather in Christ, grace leaves a visible testimony.",
  };

  const ctaCard = {
    kind: "cta",
    id: "state-gallery-video-card",
    title: "View Media Archive",
    subtitle: `${displayName} messages and moments`,
  };

  return [mediaCards[0], quoteCard, ...mediaCards.slice(1, 4), ctaCard, ...mediaCards.slice(4)];
};

export default function StateMediaListPage({ stateSlug, states }) {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Moments");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const resolvedStateName = useMemo(() => {
    if (!states || states.length === 0) return null;
    const match = states.find((state) => {
      if (typeof state === "string") {
        return slugifyState(state) === stateSlug;
      }
      if (state?.slug) {
        return slugifyState(state.slug) === stateSlug;
      }
      if (state?.name) {
        return slugifyState(state.name) === stateSlug;
      }
      return false;
    });
    if (!match) return null;
    return typeof match === "string" ? match : match?.name || null;
  }, [stateSlug, states]);

  useEffect(() => {
    if (!resolvedStateName) return;
    const params = new URLSearchParams({
      state: resolvedStateName,
      scope: "state",
    });
    setStatus("");
    apiFetch(`/media-items?${params.toString()}`)
      .then((data) => setItems(data.items || []))
      .catch((err) => setStatus(err.message));
  }, [resolvedStateName]);

  const displayName = getStateDisplayName(stateSlug, resolvedStateName);

  const filters = useMemo(() => {
    const preferred = ["Conferences", "Outreach", "Worship", "Fellowship", "Audio", "Video"];
    const available = new Set(items.map((item) => deriveCategory(item)));
    return ["All Moments", ...preferred.filter((label) => available.has(label))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = normalizeText(query);
    return items.filter((item) => {
      const category = deriveCategory(item);
      const matchesFilter = activeFilter === "All Moments" || category === activeFilter;
      if (!matchesFilter) return false;
      if (!q) return true;
      const hay = [item.title, item.description, item.series, item.speaker, item.tags]
        .map(normalizeText)
        .join(" ");
      return hay.includes(q);
    });
  }, [activeFilter, items, query]);

  const galleryItems = useMemo(
    () => buildGalleryItems(filteredItems, displayName),
    [filteredItems, displayName]
  );

  const heroCopy = `Step into the visual journey of our ministry in ${displayName}. A tapestry of worship, outreach, fellowship, and the transforming work of God across the state.`;

  return (
    <div className="state-gallery-page">
      <StatePublicHeader stateName={displayName} stateSlug={stateSlug} />

      <main className="state-gallery-main">
        <section className="state-gallery-hero">
          <div className="container state-gallery-hero__inner">
            <div className="state-gallery-hero__copy">
              <span className="state-gallery-kicker">Visual Testimony</span>
              <h1>
                Moments of <br />
                <span>Grace &amp; Glory</span>
              </h1>
              <p>{heroCopy}</p>
            </div>
            <div className="state-gallery-hero__search">
              <label className="state-gallery-search" htmlFor="state-gallery-search-input">
                <span className="material-symbols-outlined">search</span>
                <input
                  id="state-gallery-search-input"
                  type="text"
                  placeholder="Find moments..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="state-gallery-section">
          <div className="container">
            <div className="state-gallery-filters" role="tablist" aria-label="Gallery filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={filter === activeFilter ? "is-active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {status ? <p className="status">{status}</p> : null}

            {galleryItems.length ? (
              <div className="state-gallery-masonry">
                {galleryItems.map((entry, index) => {
                  if (entry.kind === "quote") {
                    return (
                      <article key={entry.id} className="state-gallery-card state-gallery-card--quote">
                        <span className="material-symbols-outlined">format_quote</span>
                        <p>{entry.quote}</p>
                      </article>
                    );
                  }

                  if (entry.kind === "cta") {
                    return (
                      <article key={entry.id} className="state-gallery-card state-gallery-card--cta">
                        <div>
                          <span className="material-symbols-outlined">video_library</span>
                          <h3>{entry.title}</h3>
                          <p>{entry.subtitle}</p>
                        </div>
                      </article>
                    );
                  }

                  const item = entry.item;
                  const meta = [item.series, item.speaker, fmtDate(item.event_date)]
                    .filter(Boolean)
                    .join(" • ");
                  const category = entry.category;
                  const noThumb = !item.thumbnail_url;
                  const tallCard = index % 5 === 2;

                  return (
                    <article
                      key={item.id}
                      className={`state-gallery-card state-gallery-card--media ${
                        tallCard ? "is-tall" : ""
                      } ${noThumb ? "is-placeholder" : ""}`}
                    >
                      <Link to={`/${stateSlug}/media/${item.id}`} className="state-gallery-card__link">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="state-gallery-card__image" />
                        ) : (
                          <div className="state-gallery-card__placeholder">
                            <span className="material-symbols-outlined">photo_camera</span>
                            <strong>{item.media_type === "audio" ? "Audio Moment" : "Gallery Moment"}</strong>
                            <span>{displayName}</span>
                          </div>
                        )}
                        <div className="state-gallery-card__body">
                          <div className="state-gallery-card__badges">
                            <span>{category}</span>
                            <span className="is-subtle">{item.media_type || "Media"}</span>
                          </div>
                          <h3>{item.title}</h3>
                          {meta ? <p className="state-gallery-card__meta">{meta}</p> : null}
                          {item.description ? <p className="state-gallery-card__desc">{item.description}</p> : null}
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="state-gallery-empty">
                <h3>No gallery moments yet</h3>
                <p>
                  Check back soon for worship, outreach, conference, and fellowship moments from {displayName}.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="state-gallery-cta">
          <div className="container state-gallery-cta__inner">
            <h2>Have a moment to share?</h2>
            <p>
              We encourage members to share high-quality photos and media moments from ministry life in {displayName}.
            </p>
            <a href={`/${stateSlug}/media`} className="state-gallery-cta__button">
              Submit Media
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
