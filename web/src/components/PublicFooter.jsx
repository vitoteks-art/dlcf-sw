import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer id="contact" className="premium-footer">
      <div className="footer-container">
        <div className="footer-column brand-info">
          <div className="footer-brand">
            <img src="/logo.png" alt="DLCF Logo" className="footer-logo" />
            <h3>DLCF South West</h3>
          </div>
          <p className="footer-desc">
            Perfecting the Saints, Evangelizing the Campus. Bringing the message of transformation to every corner of South West Zone.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon">f</a>
            <a href="#" className="social-icon">t</a>
            <a href="#" className="social-icon">y</a>
            <a href="#" className="social-icon">i</a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/beliefs">Faith & Doctrines</Link>
            <Link to="/states">Our Locations</Link>
            <Link to="/portal">Portal Access</Link>
          </nav>
        </div>

        <div className="footer-column">
          <h4>Ministries</h4>
          <nav className="footer-nav">
            <Link to="/media">Gospel Media</Link>
            <Link to="/publications">Publications</Link>
            <Link to="/retreat">Retreats</Link>
            <Link to="/gck">GCK Sessions</Link>
            <Link to="/stmc">STMC Training</Link>
          </nav>
        </div>

        <div className="footer-column newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe to our weekly state newsletter.</p>
          <div className="subscribe-form">
            <input type="email" placeholder="Your email" />
            <button type="button">Join</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} DLCF SW Zone. Built for God's Glory by SW Tech Team.</p>
        <nav className="bottom-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  );
}
