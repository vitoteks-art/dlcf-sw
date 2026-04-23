import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

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

  const leadership = [
    {
      title: "National Leadership",
      body: "Led by the National Coordinator, providing spiritual covering and strategic direction for the fellowship nationwide.",
    },
    {
      title: "Zonal & State Coordination",
      body: "Oversees operations within geo-political zones and states, ensuring uniformity in doctrine and practice.",
    },
    {
      title: "Campus & Unit Leadership",
      body: "Coordinators and executive teams managing day-to-day fellowship activities on various campuses.",
    },
  ];

  return (
    <div className="public-home about-page-premium">
      <SEO title="About Us" description="Learn about DLCF South West, our mission, mentor, message, arms, leadership structure, and foundational beliefs." />
      <PublicNav user={user} />

      <section className="public-hero home-hero home-hero-refined about-page-hero">
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">About Us</p>
            <h1>
              Building <span>Total Men</span>
            </h1>
            <p>
              The Deeper Life Campus Fellowship is an interdenominational fellowship that embraces students, staff,
              and corps members of institutions of higher learning.
            </p>
            <div className="public-cta-row home-hero-refined__actions">
              <Link className="public-btn primary" to="/states">Find a Fellowship</Link>
              <Link className="public-btn ghost" to="/beliefs">Our Beliefs</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-values-band" aria-label="About values">
        <div className="hero-values-band__inner">
          <article className="hero-value-item">
            <span className="hero-value-item__icon">✚</span>
            <div>
              <h3>Biblical Doctrine</h3>
              <p>Anchored in Scripture from Genesis to Revelation.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◉</span>
            <div>
              <h3>Spiritual Growth</h3>
              <p>Raising disciples who live and lead for Christ.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◎</span>
            <div>
              <h3>Campus Mission</h3>
              <p>Reaching students, staff, and corps members with the gospel.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">❤</span>
            <div>
              <h3>Kingdom Purpose</h3>
              <p>Commissioning believers to serve God and society well.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="dlcf-core" className="public-section homepage-dashboard about-dashboard-shell">
        <div className="homepage-dashboard__grid about-dashboard__grid">
          <article className="homepage-dashboard__panel about-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>Our Mission</h3>
            </div>
            <p className="about-dashboard__copy">
              The DLCF has a divine mandate and mission to win, build and commission students and staff of institutions
              of higher learning and fresh graduate volunteers to be their best for the Master.
            </p>
          </article>
          <article className="homepage-dashboard__panel about-dashboard__panel">
            <div className="homepage-dashboard__head">
              <h3>Our Mentor</h3>
            </div>
            <p className="about-dashboard__copy">
              Pastor Williams Folorunsho Kumuyi, the human agent God used to start Deeper Christian Life Ministry, has
              remained a shining example of scriptural conviction, sacrifice, and unwavering calling.
            </p>
          </article>
          <article className="homepage-dashboard__panel about-dashboard__panel about-dashboard__panel--wide">
            <div className="homepage-dashboard__head">
              <h3>Our Message</h3>
            </div>
            <div className="about-dashboard__copy-stack">
              <p className="about-dashboard__copy">
                Every builder knows that a house is only as strong as its foundations and the materials it is built
                with. Bible doctrines and teachings are the foundation and pillars that have enabled DLCF stand amid
                changing seasons.
              </p>
              <p className="about-dashboard__copy">
                DLCF stands against bigotry on one hand and latitudinarianism on the other, teaching the full counsel
                of God with reverence, clarity, and balance.
              </p>
            </div>
          </article>
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
              <ul className="about-page-list">
                {arm.content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="leadership" className="public-section homepage-dual-cta about-leadership-section">
        <div className="homepage-dual-cta__inner about-leadership-grid">
          {leadership.map((item) => (
            <article key={item.title} className="homepage-dual-cta__card about-leadership-card">
              <div className="homepage-dual-cta__icon">◆</div>
              <div className="homepage-dual-cta__copy">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="beliefs" className="public-section callout callout--premium about-beliefs-section">
        <div className="callout__inner about-beliefs__inner">
          <p className="section-kicker">Our Foundation</p>
          <h2>What We Believe</h2>
          <div className="about-beliefs-card">
            <ul className="about-page-list about-page-list--beliefs">
              {beliefs.map((belief, index) => (
                <li key={index}>{belief}</li>
              ))}
            </ul>
            <p className="about-beliefs__note">...and other fundamental biblical doctrines held by the Deeper Christian Life Ministry.</p>
            <div className="about-beliefs__actions">
              <Link className="public-btn primary" to="/beliefs">Go to Belief Page</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
