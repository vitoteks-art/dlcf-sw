import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function StatePublicHeader({ stateName = "Osun State", stateSlug = "osun-state" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const baseSlug = stateSlug || stateName.toLowerCase().replace(/\s+/g, "-");
  const navLinks = [
    { label: "Overview", to: `/${baseSlug}` },
    { label: "Fellowships", to: `/${baseSlug}/fellowships` },
    { label: "Events", to: `/${baseSlug}/events` },
    { label: "Publications", to: `/${baseSlug}/publications` },
    { label: "Media", to: `/${baseSlug}/media` },
    { label: "Gallery", to: `/${baseSlug}/gallery` },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="state-public-header">
      <div className="header-container">
        <Link className="public-brand" to="/">
          <div className="brand-mark">
            <img src="/logo.png" alt="Osun State" />
          </div>
          <div className="brand-text">
            <p className="brand-title">{stateName}</p>
            <p className="brand-sub">Church Headquarters</p>
          </div>
        </Link>

        <button
          type="button"
          className={`state-menu-toggle ${menuOpen ? "is-open" : ""}`}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`public-links ${menuOpen ? "is-open" : ""}`}>
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="public-link-item">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/watch-live" className="watch-live-btn">
            <span className="icon">⏺</span> Watch Live
          </Link>
        </div>
      </div>
    </header>
  );
}
