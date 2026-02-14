import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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

export default function StateDetailPage({ stateSlug, states }) {
    const location = useLocation();
    const params = useParams();

    const stateId = stateSlug || params.stateId || location.pathname.split("/")[2];

    const [statePosts, setStatePosts] = useState([]);
    const [postsError, setPostsError] = useState("");
    const [homeContent, setHomeContent] = useState(null);
    const [publicStats, setPublicStats] = useState(null);

    const resolvedStateName = useMemo(() => {
        if (!states || states.length === 0) return null;
        const match = states.find((state) => {
            const name = typeof state === "string" ? state : state?.name || state?.slug;
            return slugifyState(name) === stateId;
        });
        return typeof match === "string" ? match : match?.name || null;
    }, [stateId, states]);

    useEffect(() => {
        setPostsError("");
        apiFetch(`/public/states/${stateId}/posts`)
            .then((data) => setStatePosts(data.items || []))
            .catch((err) => setPostsError(err.message));

        apiFetch(`/public/states/${stateId}/home`)
            .then((data) => setHomeContent(data.item || null))
            .catch(() => setHomeContent(null));

        apiFetch(`/public/states/${stateId}/stats`)
            .then((data) => setPublicStats(data.item || null))
            .catch(() => setPublicStats(null));
    }, [stateId]);

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
                title: `Experience God's Presence in ${displayName}`,
                subtitle: `Sunday service is live now`,
                intro: `Join our vibrant community of believers at the heart of ${displayName}. Connecting thousands through faith, purpose, and the undiluted Word of God.`,
                ctaPrimary: "Join Live Broadcast",
                ctaSecondary: "Find a Center Near You",
                backgroundImageUrl: "/hero-image.jpg"
            },
            stats: { members: "0", regions: "0", centers: "0", growth: "15%" },
            events: [],
            gallery: [],
            contact: {},
            sections: []
        };

        const merged = !homeContent
            ? defaults
            : {
                ...defaults,
                ...homeContent,
                hero: { ...defaults.hero, ...homeContent.hero },
                stats: { ...defaults.stats, ...homeContent.stats },
            };

        // Prefer live counts from the database
        if (publicStats) {
            merged.stats = {
                ...merged.stats,
                regions: String(publicStats.regions_count ?? merged.stats.regions),
                centers: String(publicStats.centres_count ?? merged.stats.centers),
                members: String(publicStats.members_count ?? merged.stats.members),
            };
        }

        return merged;
    }, [homeContent, publicStats, displayName]);

    if (!stateId) return null;

    return (
        <div className="premium-state-page">
            <SEO title={`${displayName} State | DLCF`} description={`Welcome to DLCF ${displayName}. Join us for worship and discipleship.`} />

            <StatePublicHeader stateName={displayName} stateSlug={stateId} />

            <main>
                {/* Hero Section (Tailwind) */}
                <section className="relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${content.hero.backgroundImageUrl || "https://images.unsplash.com/photo-1523803326055-9729b9e02e5f?auto=format&fit=crop&q=80&w=1600"})`,
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b1117]/90 via-[#0b1117]/70 to-[#0b1117]/40" />
                    <div className="relative px-6 md:px-20 lg:px-40 py-16 md:py-24">
                        <div className="max-w-4xl">
                            {content.hero.subtitle ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-2 text-sm font-semibold border border-white/15">
                                    <span className="material-symbols-outlined text-[18px]">campaign</span>
                                    {content.hero.subtitle}
                                </span>
                            ) : null}

                            <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
                                {content.hero.title}
                            </h1>
                            <p className="mt-4 text-base md:text-lg text-white/85 max-w-3xl">
                                {content.hero.intro}
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to={"/media"}
                                    className="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-opacity-90 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-2">live_tv</span>
                                    {content.hero.ctaPrimary || "View Media"}
                                </Link>
                                <Link
                                    to={`/${stateId}/publications`}
                                    className="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-white/10 text-white text-sm font-bold border border-white/20 hover:bg-white/15 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-2">menu_book</span>
                                    {content.hero.ctaSecondary || "Gospel Library"}
                                </Link>
                            </div>

                            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[ 
                                  { label: "Regions", value: content.stats.regions },
                                  { label: "Members", value: content.stats.members },
                                  { label: "Centers", value: content.stats.centers },
                                  { label: "Growth", value: content.stats.growth },
                                ].map((s) => (
                                    <div key={s.label} className="rounded-xl bg-white/10 border border-white/15 p-4">
                                        <div className="text-2xl font-black text-white">{s.value}</div>
                                        <div className="text-xs font-semibold text-white/75 uppercase tracking-wider mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* About & Stats Section */}
                <section className="state-about-section">
                    <div className="container split-grid">
                        <div className="about-text">
                            <span className="section-label">Our Legacy</span>
                            <h2>Serving {displayName} State with Faith & Purpose</h2>
                            <p>
                                For over three decades, the DLCF {displayName} has stood as a beacon of hope and spiritual growth in the {displayName} region.
                                Our missionaries and volunteers are dedicated to transforming lives through the power of Christ, reaching every corner of the state.
                            </p>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-number">{content.stats.regions}</span>
                                    <span className="stat-label">Active Parishes</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{content.stats.members}</span>
                                    <span className="stat-label">Community Members</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-image-card">
                            <img src="https://placehold.co/800x600?text=State+Headquarters" alt="Headquarters" />
                        </div>
                    </div>
                </section>

                {/* Gospel Publications Section */}
                <section className="state-publications-section">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <span className="section-label">Gospel Publications</span>
                                <h2>Spiritual food and wisdom for the modern believer</h2>
                            </div>
                            <Link to={`/${stateId}/publications`} className="view-all">View All Articles →</Link>
                        </div>
                        <div className="publications-grid">
                            {(statePosts.length > 0 ? statePosts.slice(0, 3) : [
                                { id: 1, type: "Pastoral Letter", title: "Walking in Divine Dominion", content: "Exploring the biblical principles of authority and purpose." },
                                { id: 2, type: "Monthly Digest", title: "The Power of Unified Prayer", content: "A deep dive into how collective intercession is shifting atmospheres." },
                                { id: 3, type: "Leadership Insight", title: "Effective Youth Ministry", content: "Strategies for reaching the Gen Z population in Christ." }
                            ]).map((post) => (
                                <div key={post.slug || post.id} className="publication-card">
                                    <div className="card-thumb">
                                        <img src={post.feature_image_url || "https://placehold.co/400x250?text=Publication"} alt={post.title} />
                                    </div>
                                    <div className="card-body">
                                        <span className="card-tag">{post.type}</span>
                                        <h4>{post.title}</h4>
                                        <p>{post.content?.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                                        <Link to={`/${stateId}/updates/${post.slug || post.id}`} className="read-more">Read More</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Recent Sermons & Media Section */}
                <section className="state-media-section dark-bg">
                    <div className="container">
                        <div className="section-header centered">
                            <h2>Recent Sermons & Media</h2>
                            <p>Stay spiritually nourished with our latest messages and state-wide broadcasts.</p>
                        </div>
                        <div className="media-layout-grid">
                            <div className="featured-video">
                                <div className="video-poster" style={{ backgroundImage: `url(https://placehold.co/1200x800?text=Featured+Sermon)` }}>
                                    <div className="play-button">▶</div>
                                    <div className="poster-caption">
                                        <span className="date-tag">State Convention 2026</span>
                                        <h3>The Mandate of Restoration</h3>
                                        <p>Watch full session from the state headquarters.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="side-media-list">
                                {[
                                    { title: "Pastoral Thanksgiving Night", date: "Jan 12, 2026" },
                                    { title: "Healing & Deliverance Hour", date: "Jan 15, 2026" },
                                    { title: "Foundations of Faith Pt. 4", date: "Jan 19, 2026" },
                                    { title: "Workers' Retreat 2026", date: "Jan 22, 2026" }
                                ].map((item, id) => (
                                    <div key={id} className="mini-media-card">
                                        <img src={`https://placehold.co/150x100?text=Media+${id + 1}`} alt="Media" />
                                        <div className="mini-body">
                                            <h5>{item.title}</h5>
                                            <p>{item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leadership Section */}
                <section className="state-leadership-section">
                    <div className="container centered">
                        <span className="section-label">State Leadership</span>
                        <h2>Shepherding the flock with integrity and vision</h2>

                        <div className="main-leader">
                            <div className="leader-avatar-large">
                                <img src="https://placehold.co/300x300?text=State+Coordinator" alt="State Coordinator" />
                            </div>
                            <h3>Pastor Adebayo Samuel</h3>
                            <span className="leader-role">STATE COORDINATOR</span>
                            <p className="leader-quote">"Dedicated to building a purposeful fellowship where every soul is spiritually and socially empowered."</p>
                        </div>

                        <div className="sub-leadership-grid">
                            {[
                                { name: "Bro. David Johnson", role: "STATE SECRETARY" },
                                { name: "Sis. Grace Williams", role: "STATE TREASURER" },
                                { name: "Bro. Festus Akindele", role: "STATE WORK COORDINATOR" },
                                { name: "Bro. Emmanuel Okoro", role: "STATE MEDIA LEAD" }
                            ].map((leader, idx) => (
                                <div key={idx} className="leader-card-small">
                                    <div className="leader-avatar-small">
                                        <img src={`https://placehold.co/150x150?text=Ref+${idx}`} alt={leader.name} />
                                    </div>
                                    <h5>{leader.name}</h5>
                                    <p>{leader.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Service Times & Locations Section */}
                <section className="state-locations-section gray-bg">
                    <div className="container split-grid">
                        <div className="locations-info">
                            <h2>Service Times & Locations</h2>
                            <p>Find us across the state at our various meeting centers.</p>

                            <div className="location-list">
                                <div className="location-item active">
                                    <div className="loc-icon">📍</div>
                                    <div className="loc-details">
                                        <h4>State Headquarters</h4>
                                        <p>Plot 12, Church Avenue, Old Governor's Office Area, {displayName} State.</p>
                                        <div className="loc-times">
                                            <span><strong>SUNDAYS:</strong> 8:00 AM & 5:00 PM</span>
                                            <span><strong>THURSDAYS:</strong> 6:00 PM</span>
                                        </div>
                                        <Link to="/" className="get-directions">Get Directions ↗</Link>
                                    </div>
                                </div>
                                <div className="location-item">
                                    <div className="loc-icon">📍</div>
                                    <div className="loc-details">
                                        <h4>Iwo Zonal Center</h4>
                                        <p>Plot 5, Main Road, Iwo, {displayName} State.</p>
                                    </div>
                                </div>
                                <div className="location-item">
                                    <div className="loc-icon">📍</div>
                                    <div className="loc-details">
                                        <h4>Ilesa Town Center</h4>
                                        <p>Victory Cathedral, Inner Road, Ilesa, Osun.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="locations-map">
                            <div className="map-placeholder">
                                <img src="https://placehold.co/800x800?text=Interactive+State+Map" alt="Map" />
                                <div className="map-overlay">
                                    <div className="overlay-content">
                                        <span className="icon">📍</span>
                                        <h4>View Centers on Map</h4>
                                        <p>Explore all 400+ parishes and fellowship centers across the state.</p>
                                        <button className="btn-primary-small">Explore Map</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

