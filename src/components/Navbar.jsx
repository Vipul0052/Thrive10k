import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const navLinks = [
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text serif">thrive</span>
          <span className="navbar__logo-badge">10K</span>
        </Link>

        {/* Desktop links */}
        <nav className="navbar__links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`navbar__link ${pathname === link.to ? "navbar__link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link to="/login" className="navbar__cta">
          Sign In
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`navbar__toggle-bar ${open ? "navbar__toggle-bar--open" : ""}`} />
          <span className={`navbar__toggle-bar ${open ? "navbar__toggle-bar--open" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <nav className={`navbar__mobile ${open ? "navbar__mobile--open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="navbar__mobile-link"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link to="/signup" className="navbar__mobile-cta" onClick={() => setOpen(false)}>
          Get Started
        </Link>
      </nav>
    </header>
  );
}
