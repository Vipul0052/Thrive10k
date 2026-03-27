import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__inner">
        {/* Left — Brand Side */}
        <div className="auth-page__brand">
          <div className="auth-page__brand-content">
            <Link to="/" className="auth-page__logo">
              <span className="navbar__logo-text serif">thrive</span>
              <span className="navbar__logo-badge">10K</span>
            </Link>
            <h2 className="auth-page__brand-heading serif">
              Every hour is a brick. Keep building.
            </h2>
            <div className="auth-page__brand-stats">
              <div className="auth-page__brand-stat">
                <span className="auth-page__brand-stat-value serif">2.4M+</span>
                <span className="auth-page__brand-stat-label">hours tracked</span>
              </div>
              <div className="auth-page__brand-stat">
                <span className="auth-page__brand-stat-value serif">18K</span>
                <span className="auth-page__brand-stat-label">goals crushed</span>
              </div>
              <div className="auth-page__brand-stat">
                <span className="auth-page__brand-stat-value serif">47 days</span>
                <span className="auth-page__brand-stat-label">avg streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form Side */}
        <div className="auth-page__form-wrap">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="auth-page__form-container"
          >
            <div className="auth-page__form-header">
              <h1 className="auth-page__form-title">Welcome back</h1>
              <p className="auth-page__form-subtitle">
                Log in to continue your mastery journey.
              </p>
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: "14px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "10px", marginBottom: "8px" }}>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  className="auth-form__input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-form__field">
                <div className="auth-form__label-row">
                  <label className="auth-form__label" htmlFor="login-password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="auth-form__forgot" style={{ fontSize: "13px", color: "var(--color-ink-soft)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                    Forgot?
                  </Link>
                </div>
                <div className="auth-form__input-wrap">
                  <input
                    id="login-password"
                    className="auth-form__input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-form__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-form__submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <p className="auth-page__switch">
              Don't have an account?{" "}
              <Link to="/signup" className="auth-page__switch-link">
                Sign up free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
