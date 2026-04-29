import { useEffect, useState } from "react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { apiFetch, ensureCsrf } from "../api";

export default function ContactPage({ user }) {
  const contactDetails = [
    {
      title: "Email Address",
      value: "info@dlcfsw.org.ng",
      hint: "For partnership, ministry, and general enquiries.",
    },
    {
      title: "Office Address",
      value: "DLCF South West Zone",
      hint: "Zonal administrative and ministry contact point.",
    },
    {
      title: "Support",
      value: "State and fellowship connection guidance",
      hint: "We help direct students, staff, and corps members appropriately.",
    },
  ];

  const phoneDetails = {
    title: "Phone Line",
    value: "+234 800 000 0000",
    hint: "Reach the zonal team directly for urgent guidance and enquiries.",
  };

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", captcha_answer: "" });
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCaptcha = async () => {
    try {
      const data = await apiFetch("/contact-captcha");
      setCaptchaQuestion(data.question || "");
    } catch {
      setCaptchaQuestion("");
    }
  };

  useEffect(() => {
    ensureCsrf().catch(() => {});
    loadCaptcha();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    try {
      const data = await apiFetch("/contact-submit", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus(data.message || "Your message has been sent.");
      setForm({ name: "", email: "", subject: "", message: "", captcha_answer: "" });
      await loadCaptcha();
    } catch (err) {
      setStatus(err.message || "Unable to send message.");
      await loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="public-home contact-page-premium">
      <SEO title="Contact Us" description="Reach DLCF South West for enquiries, fellowship connections, and ministry information." />
      <PublicNav user={user} />

      <section
        className="public-hero home-hero home-hero-refined contact-page-hero"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(4, 10, 18, 0.98) 0%, rgba(4, 10, 18, 0.9) 34%, rgba(7, 15, 25, 0.48) 58%, rgba(7, 15, 25, 0.16) 100%), url("/contact-hero-premium.png")',
        }}
      >
        <div className="home-hero-refined__inner">
          <div className="public-hero-content home-hero-refined__content">
            <p className="public-kicker home-hero-refined__kicker">Contact</p>
            <h1>
              Reach <span>DLCF South West</span>
            </h1>
            <p>
              Get in touch for fellowship enquiries, ministry information, partnership opportunities, and state-level connections across the zone.
            </p>
            <div className="public-cta-row home-hero-refined__actions">
              <a className="public-btn primary" href="mailto:info@dlcfsw.org.ng">Email Us</a>
              <a className="public-btn ghost" href="tel:+2348000000000">Call Us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-values-band" aria-label="Contact summary">
        <div className="hero-values-band__inner">
          <article className="hero-value-item">
            <span className="hero-value-item__icon">✆</span>
            <div>
              <h3>Direct Access</h3>
              <p>Reach the zonal team for enquiries and guidance.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◉</span>
            <div>
              <h3>State Connections</h3>
              <p>Find the right fellowship, campus, or state contact point.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◎</span>
            <div>
              <h3>Ministry Enquiries</h3>
              <p>Connect for collaboration, updates, and ministry support.</p>
            </div>
          </article>
          <article className="hero-value-item">
            <span className="hero-value-item__icon">◆</span>
            <div>
              <h3>Fellowship Guidance</h3>
              <p>We can help direct students, staff, and corps members.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="public-section homepage-dashboard contact-dashboard-shell">
        <div className="homepage-dashboard__grid contact-dashboard__grid">
          <article className="homepage-dashboard__panel contact-dashboard__panel contact-dashboard__panel--wide">
            <div className="homepage-dashboard__head">
              <h3>Get in Touch</h3>
            </div>
            <p className="about-dashboard__copy">
              Whether you are looking for a fellowship centre, need ministry information, or want to connect with the zonal leadership, this page gives you the best starting point.
            </p>
            <div className="contact-page__layout">
              <div className="contact-page__info-column">
                <div className="contact-page__cards contact-page__cards--stacked">
                  {contactDetails.map((item) => (
                    <div key={item.title} className="contact-page__card">
                      <strong>{item.title}</strong>
                      <span>{item.value}</span>
                      <p>{item.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="contact-page__phone-column">
                <div className="contact-page__phone-card">
                  <strong>{phoneDetails.title}</strong>
                  <span>{phoneDetails.value}</span>
                  <p>{phoneDetails.hint}</p>
                </div>
              </aside>
            </div>

            <form className="contact-form-premium" onSubmit={handleSubmit}>
              <div className="contact-form-premium__grid">
                <label>
                  Full Name
                  <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
                </label>
                <label>
                  Email Address
                  <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
                </label>
              </div>
              <label>
                Subject
                <input type="text" value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} required />
              </label>
              <label>
                Message
                <textarea rows="6" value={form.message} onChange={(e) => handleChange("message", e.target.value)} required />
              </label>
              <div className="contact-form-premium__grid contact-form-premium__grid--captcha">
                <label>
                  Human Check
                  <input type="text" value={captchaQuestion} disabled />
                </label>
                <label>
                  Your Answer
                  <input type="text" value={form.captcha_answer} onChange={(e) => handleChange("captcha_answer", e.target.value)} required />
                </label>
              </div>
              {status ? <p className="contact-form-premium__status">{status}</p> : null}
              <div className="about-beliefs__actions">
                <button className="public-btn primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </article>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
