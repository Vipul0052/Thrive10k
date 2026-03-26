import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="navbar__logo-text serif">thrive</span>
              <span className="navbar__logo-badge">10K</span>
            </Link>
            <p className="footer__tagline">
              Your mastery operating system. Built for the broke, the ambitious,
              and the obsessed.
            </p>
          </div>

          {/* Product Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Product</h4>
            <Link to="/features" className="footer__link">Features</Link>
            <Link to="/pricing" className="footer__link">Pricing</Link>
            <Link to="/changelog" className="footer__link">Changelog</Link>
          </div>

          {/* Company */}
          <div className="footer__col">
            <h4 className="footer__col-title">Company</h4>
            <Link to="/about" className="footer__link">About</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
            <a href="https://discord.gg" className="footer__link" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>

          {/* Legal */}
          <div className="footer__col">
            <h4 className="footer__col-title">Legal</h4>
            <Link to="/privacy" className="footer__link">Privacy</Link>
            <Link to="/terms" className="footer__link">Terms</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Thrive10K. Every hour counts.
          </p>
        </div>
      </div>
    </footer>
  );
}
