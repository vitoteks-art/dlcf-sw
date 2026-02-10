import { useState } from "react";
import { Link } from "react-router-dom";

export default function PublicNav({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`public-nav ${menuOpen ? "is-open" : ""}`}>
      {menuOpen && (
        <div
          className="public-nav-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Link className="public-brand" to="/">
        <div className="brand-mark">
          <img
            src="/logo.png"
            alt="DLCF"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        <div>
          <p className="brand-title">Deeper Life Campus Fellowship</p>
          <p className="brand-sub">South West Zone</p>
        </div>
      </Link>
      <button
        className="public-nav-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className="public-links" onClick={() => setMenuOpen(false)}>
        <Link to="/about">About Us</Link>
        <Link to="/beliefs">What We Believe</Link>
        <Link to="/media">Media</Link>
        <Link to="/publications">Gospel Library</Link>
        <Link to="/states">States</Link>
        <Link to="/#contact">Contact</Link>
        <Link to="/portal" className="public-link">
          {user ? "Portal" : "Login"}
        </Link>
        <Link to="/#cta" className="public-cta">
          Join Us
        </Link>
      </nav>
    </header>
  );
}
