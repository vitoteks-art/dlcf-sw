import { Link } from "react-router-dom";

export default function StatePublicHeader({ stateName = "Osun State", stateSlug = "osun-state" }) {
  const baseSlug = stateSlug || stateName.toLowerCase().replace(/\s+/g, "-");
  const navLinks = [
    { label: "Overview", to: `/${baseSlug}` },
    { label: "Publications", to: `/${baseSlug}/publications` },
    { label: "Media", to: `/${baseSlug}/media` },
    { label: "Leadership", to: `/${baseSlug}/leadership` },
    { label: "Locations", to: `/${baseSlug}/locations` },
    { label: "Contact", to: `/${baseSlug}/contact` },
  ];
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

        <nav className="public-links">
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
