import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const slugifyState = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function displayStateName(name) {
  const n = String(name || "").trim();
  // Convert "X State (North)" => "X (North) State"
  const m = n.match(/^(.+?)\s+State\s+\((.+)\)$/i);
  if (m) return `${m[1]} (${m[2]}) State`;
  // Convert "Osun State 1" => "Osun (1) State"
  const m2 = n.match(/^(.+?)\s+State\s+(\d+)$/i);
  if (m2) return `${m2[1]} (${m2[2]}) State`;
  return n;
}

export default function StatesPage({ states, user }) {
  const [query, setQuery] = useState("");

  const normalized = useMemo(() => {
    const items = (states || []).map((state) => {
      const nameRaw = typeof state === "string" ? state : state?.name || state?.slug || String(state || "");
      const slugSource = typeof state === "string" ? state : state?.slug || state?.name || String(state || "");
      return {
        name: displayStateName(nameRaw),
        slug: slugifyState(slugSource),
      };
    });

    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }, [states, query]);

  return (
    <div className="public-home states-page-premium">
      <SEO
        title="States Directory"
        description="Find your local state fellowship and connect with communities across the South West Zone."
      />
      <PublicNav user={user} />

      <section
        className="public-hero home-hero home-hero-refined states-page-hero"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(4, 10, 18, 0.98) 0%, rgba(4, 10, 18, 0.9) 34%, rgba(7, 15, 25, 0.48) 58%, rgba(7, 15, 25, 0.16) 100%), url("/states-hero-premium.png")',
        }}
      >
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">States Directory</p>
            <h1>
              Browse Our <span>States</span>
            </h1>
            <p>Find your local state fellowship and connect with our communities across the South West Zone.</p>
          </div>
        </div>
      </section>

      <section className="public-section states-directory-premium">
        <div className="states-search-premium">
          <div className="states-search-premium__input">
            <span className="material-symbols-outlined">search</span>
            <input
              placeholder="Search for a state..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" onClick={() => setQuery("")}>Clear</button>
          </div>
        </div>

        <div className="states-grid-premium-list">
          {normalized.length === 0 ? (
            <div className="states-empty-premium">No states found.</div>
          ) : (
            normalized.map((s) => (
              <article key={s.slug || s.name} className="state-card-premium">
                <div className="state-card-premium__cover" />
                <div className="state-card-premium__body">
                  <h3>{s.name}</h3>
                  <div className="state-card-premium__meta">
                    <p>Service times: to be added</p>
                    <p>Weekly programs: to be added</p>
                    <p>Location: to be added</p>
                  </div>
                  <div className="state-card-premium__actions">
                    <Link to={`/${s.slug}`}>View State</Link>
                    <Link to={`/${s.slug}/publications`}>Library</Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="states-note-premium">
          <p>Don&apos;t see your state listed? Please contact the zonal admin to update the directory.</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
