import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get("email") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Navigate to verify email page
      navigate("/verify-email", { state: { email, name } });
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
              Your first hour starts the moment you sign up.
            </h2>
            <ul className="auth-page__brand-perks">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Free forever — no credit card
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited hour logging
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Streak tracking + heatmap
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                3 active goals
              </li>
            </ul>
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
              <h1 className="auth-page__form-title">Create your account</h1>
              <p className="auth-page__form-subtitle">
                Start tracking your journey to 10,000 hours.
              </p>
            </div>

            <div className="auth-page__divider">
              <span>Sign up with email</span>
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: "14px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "10px", marginBottom: "8px" }}>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSignup}>
              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  className="auth-form__input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="signup-email">
                  Email
                </label>
                <input
                  id="signup-email"
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
                <label className="auth-form__label" htmlFor="signup-password">
                  Password
                </label>
                <div className="auth-form__input-wrap">
                  <input
                    id="signup-password"
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

              <button type="submit" className="auth-form__submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account →"}
              </button>

              <p className="auth-form__terms">
                By signing up, you agree to our{" "}
                <Link to="/terms">Terms</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </form>

            <p className="auth-page__switch">
              Already have an account?{" "}
              <Link to="/login" className="auth-page__switch-link">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
