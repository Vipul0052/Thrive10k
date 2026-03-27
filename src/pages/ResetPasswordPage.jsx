import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase puts tokens in the URL hash after clicking the reset link.
  // The supabase client auto-picks them up via onAuthStateChange.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if already in a session (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/dashboard"), 2000);
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
              Fresh start. Same ambition.
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
            {success ? (
              /* ── Success State ── */
              <div style={{ textAlign: "center" }}>
                <div style={{ margin: "0 auto 16px", width: "64px", height: "64px", borderRadius: "16px", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h1 className="auth-page__form-title">Password updated!</h1>
                <p className="auth-page__form-subtitle" style={{ marginTop: "8px" }}>
                  Your password has been reset successfully. Redirecting you to your dashboard...
                </p>
              </div>
            ) : !sessionReady ? (
              /* ── Waiting for session ── */
              <div style={{ textAlign: "center" }}>
                <h1 className="auth-page__form-title">Loading...</h1>
                <p className="auth-page__form-subtitle" style={{ marginTop: "8px" }}>
                  Verifying your reset link. If this takes too long,{" "}
                  <Link to="/forgot-password" style={{ textDecoration: "underline" }}>request a new link</Link>.
                </p>
              </div>
            ) : (
              /* ── Form State ── */
              <>
                <div className="auth-page__form-header">
                  <h1 className="auth-page__form-title">Set new password</h1>
                  <p className="auth-page__form-subtitle">
                    Choose a strong password for your account.
                  </p>
                </div>

                {error && (
                  <div style={{ color: "#ef4444", fontSize: "14px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "10px", marginBottom: "8px" }}>
                    {error}
                  </div>
                )}

                <form className="auth-form" onSubmit={handleReset}>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="new-password">
                      New Password
                    </label>
                    <div className="auth-form__input-wrap">
                      <input
                        id="new-password"
                        className="auth-form__input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={6}
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

                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      className="auth-form__input"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>

                  <button type="submit" className="auth-form__submit" disabled={loading}>
                    {loading ? "Updating..." : "Reset Password →"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
