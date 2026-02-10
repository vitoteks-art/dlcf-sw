import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";

export default function AboutPage({ user }) {
    const arms = [
        {
            title: "Students",
            icon: "🎓",
            content: [
                "Qualify by being a student in any higher institution.",
                "Weekly campus fellowships, bible studies, and prayer meetings.",
                "Systematic discipleship and leadership training programs.",
                "Outreach programs to win other students to Christ.",
            ],
        },
        {
            title: "Staff",
            icon: "💼",
            content: [
                "For academic and non-academic staff in higher institutions.",
                "Fellowship opportunities tailored for working professionals.",
                "Work-life-faith balance initiatives and seminars.",
                "Mentoring programs for students and corps members.",
            ],
        },
        {
            title: "Corps Members",
            icon: "🇳🇬",
            content: [
                "Support network for NYSC corps members serving nationwide.",
                "Integration assistance into local fellowships and communities.",
                "Specialized programs for career and spiritual development.",
                "Fellowship locations in every state capital and major town.",
            ],
        },
    ];

    const beliefs = [
        "The Bible is the inspired and only infallible and authoritative Word of God.",
        "There is one God, eternally existent in three persons: God the Father, God the Son, and God the Holy Ghost.",
        "In the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His vicarious and atoning death, in His bodily resurrection, in His ascension to the right hand of the Father, and in His personal future return to this earth in power and glory.",
        "The only means of being cleansed from sin is through repentance and faith in the precious blood of Christ.",
        "Regeneration by the Holy Spirit is absolutely essential for personal salvation.",
    ];

    return (
        <div className="public-home">
            <PublicNav user={user} />

            <section className="public-hero" style={{ minHeight: "60vh" }}>
                <div className="public-hero-content">
                    <p className="public-kicker">About Us</p>
                    <h1>
                        Building <span>Total Men</span>
                    </h1>
                    <p>
                        The Deeper Life Campus Fellowship is an interdenominational fellowship
                        that embraces students, staff, and corps members of institutions of
                        higher learning.
                    </p>
                </div>
            </section>

            <section id="dlcf-core" className="public-section">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Deeper Life Campus Fellowship</p>
                        <h2>Our Mission, Mentor, and Message</h2>
                    </div>
                </div>
                <div className="states-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                    <div className="state-tile" style={{ display: "block", textAlign: "left", padding: "2rem" }}>
                        <h3>Our Mission</h3>
                        <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                            The DLCF has a divine mandate and mission to win, build and commission students and staff
                            of institutions of higher learning and fresh graduate volunteers (corps members) schemes
                            to be their best for the Master. It is an inter-denominational fellowship, embracing
                            campus Christians who share the same doctrinal belief irrespective of their denominations
                            and affiliations.
                        </p>
                    </div>
                    <div className="state-tile" style={{ display: "block", textAlign: "left", padding: "2rem" }}>
                        <h3>Our Mentor</h3>
                        <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                            The history of Deeper Life Campus Fellowship cannot be written without mentioning the
                            human agent that God used to start Deeper Christian Life Ministry, of which DLCF is an arm:
                            Pastor Williams Folorunsho Kumuyi. Born in 1941, he graduated from the University of Ibadan
                            with a first class honors in Mathematics. That same year, he was offered a university
                            scholarship for a doctorate degree, which he turned down because he had a greater calling.
                        </p>
                    </div>
                    <div className="state-tile" style={{ display: "block", textAlign: "left", padding: "2rem" }}>
                        <h3>Our Message</h3>
                        <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                            Every builder knows that a house is only as strong as its foundations and the strength of
                            the materials it is built with. Bible doctrines and teachings are the foundation and
                            pillars that have enabled the DLCF stand amidst the changing seasons of life.
                        </p>
                        <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                            The DLCF stands against bigotry on the one hand and latitudinarianism on the other. It
                            believes that all scripture is given by the inspiration of God and is profitable for
                            doctrine, for reproof, for correction, for instruction in righteousness. The DLCF teaches
                            all the Word of God from Genesis to Revelation, adding nothing to the word and taking
                            nothing from it.
                        </p>
                        <p style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                            The DLCF draws a clear distinction between nominal and genuine Christianity and between
                            fanaticism and true worship. DLCF teaches the importance of daily living an overcoming
                            Christian life. The entire Scriptures shall be the only rule for standard of conduct,
                            discipline and government in the fellowship and pattern of Christian work.
                        </p>
                    </div>
                </div>
            </section>

            <section id="arms" className="public-section arms">
                <p className="section-kicker">Who We Are</p>
                <h2>The Three Arms of DLCF</h2>
                <div className="arms-grid">
                    {arms.map((arm) => (
                        <div key={arm.title} className="arms-card" style={{ cursor: "default" }}>
                            <div className="arms-icon">{arm.icon}</div>
                            <h3>{arm.title}</h3>
                            <ul style={{ paddingLeft: "1.2rem", marginTop: "1rem" }}>
                                {arm.content.map((item, idx) => (
                                    <li key={idx} style={{ marginBottom: "0.5rem" }}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section id="leadership" className="public-section">
                <div className="section-head">
                    <div>
                        <p className="section-kicker">Governance</p>
                        <h2>Leadership Structure</h2>
                    </div>
                </div>
                <div className="news-list">
                    <div className="news-item">
                        <div>
                            <h3>National Leadership</h3>
                            <p>Led by the National Coordinator, providing spiritual covering and strategic direction for the fellowship nationwide.</p>
                        </div>
                    </div>
                    <div className="news-item">
                        <div>
                            <h3>Zonal & State Coordination</h3>
                            <p>Oversees operations within geo-political zones and states, ensuring uniformity in doctrine and practice.</p>
                        </div>
                    </div>
                    <div className="news-item">
                        <div>
                            <h3>Campus & Unit Leadership</h3>
                            <p>Coordinators and executive teams managing day-to-day fellowship activities on various campuses.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="beliefs" className="public-section states">
                <p className="section-kicker">Our Foundation</p>
                <h2>What We Believe</h2>
                <div className="states-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div className="state-tile" style={{ display: "block", textAlign: "left", padding: "2rem" }}>
                        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
                            {beliefs.map((belief, index) => (
                                <li key={index} style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>{belief}</li>
                            ))}
                        </ul>
                        <p style={{ marginTop: "2rem", fontStyle: "italic" }}>
                            ...and other fundamental biblical doctrines held by the Deeper Christian Life Ministry.
                        </p>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
