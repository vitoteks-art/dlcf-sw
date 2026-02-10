
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

export default function StatesPage({ states, user }) {
  return (
    <div className="public-home">
      <SEO
        title="All States"
        description="Explore Deeper Life Campus Fellowship presence across all 13 states in the South West Zone."
      />
      <PublicNav user={user} />

      <section className="public-hero" style={{ minHeight: "50vh", backgroundImage: "linear-gradient(to right, #0b1117, #231f3b)" }}>
        <div className="public-hero-content">
          <p className="public-kicker">Our Coverage</p>
          <h1>All States</h1>
          <p>Explore our fellowship presence in all states across the South West Zone.</p>
        </div>
      </section>

      <div className="public-section" style={{ marginTop: "60px" }}>
        <div className="states-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {states.length === 0 ? (
            <div className="state-tile">No states loaded yet</div>
          ) : (
            states.map((state) => {
              const stateName = typeof state === "string" ? state : state?.name || state;
              const slugSource = typeof state === "string" ? state : state?.slug || state?.name || state;
              return (
                <Link
                  to={`/${slugifyState(slugSource)}`}
                  key={stateName}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="state-tile"
                    style={{ padding: "40px", fontSize: "1.5rem" }}
                  >
                    {stateName}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
