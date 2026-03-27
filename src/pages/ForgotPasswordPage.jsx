import { motion } from "motion/react";
import { Link } from "react-router-dom";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
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
              Everyone forgets sometimes. We got you.
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
            {sent ? (
              /* ── Success State ── */
              <div style={{ textAlign: "center" }}>
                <div style={{ margin: "0 auto 16px", width: "64px", height: "64px", borderRadius: "16px", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h1 className="auth-page__form-title">Check your email</h1>
                <p className="auth-page__form-subtitle" style={{ marginTop: "8px" }}>
                  We sent a password reset link to
                </p>
                <p style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: "15px", marginTop: "4px" }}>
                  {email}
                </p>
                <p style={{ fontSize: "14px", color: "var(--color-ink-soft)", marginTop: "20px", lineHeight: 1.6 }}>
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Link to="/login" className="auth-form__submit" style={{ display: "block", textAlign: "center", marginTop: "24px", textDecoration: "none" }}>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form State ── */
              <>
                <div className="auth-page__form-header">
                  <h1 className="auth-page__form-title">Forgot password?</h1>
                  <p className="auth-page__form-subtitle">
                    No worries. Enter your email and we'll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div style={{ color: "#ef4444", fontSize: "14px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "10px", marginBottom: "8px" }}>
                    {error}
                  </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="forgot-email">
                      Email
                    </label>
                    <input
                      id="forgot-email"
                      className="auth-form__input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <button type="submit" className="auth-form__submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link →"}
                  </button>
                </form>

                <p className="auth-page__switch">
                  Remember your password?{" "}
                  <Link to="/login" className="auth-page__switch-link">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
