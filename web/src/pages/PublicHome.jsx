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

export default function PublicHome({ states, stateSummaries, user }) {
  const arms = [
    {
      title: "Students",
      desc: "Campus fellowships, training, and discipleship for students.",
    },
    {
      title: "Staff",
      desc: "Workplace fellowship and mentoring for staff members.",
    },
    {
      title: "Corps Members",
      desc: "Support and community for corpers serving nationwide.",
    },
  ];
  const events = [
    { title: "State Congress Preparation", date: "TBA" },
    { title: "Zonal Congress Registration", date: "TBA" },
    { title: "Leadership Retreat", date: "TBA" },
  ];
  const announcements = [
    { title: "Weekly Attendance Portal Update", date: "TBA" },
    { title: "Regional Training Schedule", date: "TBA" },
    { title: "Media & Publications Launch", date: "TBA" },
  ];
  const [mediaItems, setMediaItems] = useState([]);
  const [publicationItems, setPublicationItems] = useState([]);
  const [stateMediaItems, setStateMediaItems] = useState([]);
  const [statePublicationItems, setStatePublicationItems] = useState([]);

  useEffect(() => {
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
  const featuredPublications = useMemo(
    () => publicationItems.slice(0, 3),
    [publicationItems]
  );
  const featuredStateMedia = useMemo(
    () => stateMediaItems.slice(0, 3),
    [stateMediaItems]
  );
  const featuredStatePublications = useMemo(
    () => statePublicationItems.slice(0, 3),
    [statePublicationItems]
  );

  return (
    <div className="public-home">
      <SEO
        title="Home"
        description="Deeper Life Campus Fellowship - Inspiring Leadership. Raising disciples through worship, the word, and authentic community."
      />
      <PublicNav user={user} />

      <section className="public-hero home-hero">
        <div className="public-hero-content">
          <p className="public-kicker">Deeper Life Campus Fellowship</p>
          <h1>
            Inspiring <span>Leadership</span>
          </h1>
          <p>
            Raising disciples through worship, the word, and authentic community across
            campuses, workplaces, and cities.
          </p>
          <div className="public-cta-row">
            <a className="public-btn primary" href="#cta">
              Join Us
            </a>
            <a className="public-btn ghost" href="#events">
              Upcoming Events
            </a>
          </div>
          <div className="public-meta">
            <span>Sunday Worship</span>
            <span>10:00 AM & 4:00 PM</span>
          </div>
        </div>

      </section>

      <section className="public-section about-intro">
        <div className="about-media">
          <div className="about-frame">
            <img src="/hero-image.jpg" alt="DLCF South West leadership" />
          </div>
          <span className="about-orb orb-top" />
          <span className="about-orb orb-bottom" />
        </div>
        <div className="about-content">
          <p className="section-kicker">Who we are</p>
          <h2>Welcome to DLCF South West</h2>
          <p>
            Experience inspiring worship, enlightening word, and gracious wonders. We are a
            people saved by grace, empowered by the Holy Spirit, and committed to authentic
            Bible Christianity across campuses and cities.
          </p>
          <p>
            We practice and preach the Word to raise disciples who live boldly for Christ and
            prepare for His coming kingdom.
          </p>
          <div className="about-pill-row">
            <span>Our mandate</span>
            <span>We exist primarily</span>
            <span>Passionate about God</span>
          </div>
        </div>
      </section>

      <section className="public-section media-cta">
        <div className="media-cta-overlay" />
        <div className="media-cta-content">
          <p className="media-cta-kicker">Learn and gain spiritual upliftment</p>
          <h2>Watch &amp; Download Sermons</h2>
          <Link className="public-btn bright" to="/media">
            Get Started
          </Link>
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
            <div className="preview-head">
              <h3>Media</h3>
              <p className="lede">Audio &amp; video messages.</p>
            </div>
            <div className="preview-list">
              {featuredMedia.length === 0 ? (
                <p className="lede">New media coming soon.</p>
              ) : (
                featuredMedia.map((item) => (
                  <a
                    key={item.id}
                    className="preview-item"
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.speaker || item.series || item.media_type}</p>
                    </div>
                    <span className="preview-pill">{item.media_type}</span>
                  </a>
                ))
              )}
            </div>
          </div>
          <div className="media-preview-card">
            <div className="preview-head">
              <h3>Publications</h3>
              <p className="lede">Manuals, outlines, and resources.</p>
            </div>
            <div className="preview-list">
              {featuredPublications.length === 0 ? (
                <p className="lede">New publications coming soon.</p>
              ) : (
                featuredPublications.map((item) => (
                  <a
                    key={item.id}
                    className="preview-item"
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.publication_type}</p>
                    </div>
                    <span className="preview-pill">PDF</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section media-preview">
        <div className="section-head">
          <div>
            <p className="section-kicker">From the States</p>
            <h2>State-wide highlights</h2>
          </div>
          <div className="preview-actions">
            <Link to="/states">Browse States</Link>
          </div>
        </div>
        <div className="media-preview-grid">
          <div className="media-preview-card">
            <div className="preview-head">
              <h3>State Media</h3>
              <p className="lede">Recent media across all states.</p>
            </div>
            <div className="preview-list">
              {featuredStateMedia.length === 0 ? (
                <p className="lede">No state media yet.</p>
              ) : (
                featuredStateMedia.map((item) => {
                  const stateSlug = slugifyState(item.state || "");
                  const target = stateSlug
                    ? `/${stateSlug}/media/${item.id}`
                    : "/states";
                  return (
                    <Link key={item.id} className="preview-item" to={target}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.state || "State"}</p>
                      </div>
                      <span className="preview-pill">{item.media_type}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
          <div className="media-preview-card">
            <div className="preview-head">
              <h3>State Publications</h3>
              <p className="lede">Recent publications across all states.</p>
            </div>
            <div className="preview-list">
              {featuredStatePublications.length === 0 ? (
                <p className="lede">No state publications yet.</p>
              ) : (
                featuredStatePublications.map((item) => {
                  const stateSlug = slugifyState(item.state || "");
                  const target = stateSlug
                    ? `/${stateSlug}/publications/${item.id}`
                    : "/states";
                  return (
                    <Link key={item.id} className="preview-item" to={target}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.state || "State"}</p>
                      </div>
                      <span className="preview-pill">PDF</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="arms" className="public-section arms">
        <p className="section-kicker">DLCF Arms</p>
        <h2>Students, Staff, and Corps Members</h2>
        <div className="arms-grid">
          {arms.map((arm) => (
            <div key={arm.title} className="arms-card">
              <div className="arms-icon">{arm.title.charAt(0)}</div>
              <h3>{arm.title}</h3>
              <p>{arm.desc}</p>
              <Link to="/states">Learn more</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="our-mentor" className="public-section mentor-section">
        <div className="mentor-grid">
          <div className="mentor-copy">
            <p className="section-kicker">Our Mentor</p>
            <h2>Pastor W.F. Kumuyi</h2>
            <p>
              The history of Deeper Life Campus Fellowship cannot be written without mentioning the
              human agent that God used to start Deeper Christian Life Ministry, of which DLCF is an arm.
              He is Pastor Williams Folorunsho Kumuyi.
            </p>
            <p>
              Born in 1941, he graduated from the Nigerian Premier University, University of Ibadan,
              with a first class honors in Mathematics. That same year of his graduation, he was offered
              the University Scholarship for Doctorate Degree, which he turned down because he had a
              greater calling and all of us can bear witness to that fact now that he truly had a greater
              calling.
            </p>
          </div>
          <div className="mentor-media">
            <div className="mentor-frame">
              <img src="/src/assets/gs.png" alt="General Superintendent" />
            </div>
            <div className="mentor-caption">
              General Superintendent (GS)
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="public-section events">
        <div className="section-head">
          <div>
            <p className="section-kicker">Recent Events</p>
            <h2>See what God is doing</h2>
          </div>
          <Link to="/events">View All Events</Link>
        </div>
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.title} className="event-card">
              <div className="event-photo" />
              <h3>{event.title}</h3>
              <p>{event.date}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="news" className="public-section news">
        <div className="section-head">
          <div>
            <p className="section-kicker">Announcements & News</p>
            <h2>Latest updates</h2>
          </div>
          <Link to="/blog">Read More</Link>
        </div>
        <div className="news-list">
          {announcements.map((item) => (
            <div key={item.title} className="news-item">
              <div>
                <h3>{item.title}</h3>
                <p>{item.date}</p>
              </div>
              <Link to="/blog">Read More</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="states" className="public-section states">
        <p className="section-kicker">States Overview</p>
        <h2>Explore all 13 states</h2>
        <div className="states-grid">
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
                  <div className="state-tile">{stateName}</div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section id="cta" className="public-section callout">
        <h2>Ready to Take the Next Step?</h2>
        <p>
          Find your state, join upcoming events, and connect with your local fellowship.
        </p>
        <div className="public-cta-row">
          <Link className="public-btn primary" to="/states">
            Find Your State
          </Link>
          <a className="public-btn ghost" href="#events">
            View Events
          </a>
          <a className="public-btn ghost" href="#contact">
            Contact Us
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
