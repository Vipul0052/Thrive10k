import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const name = location.state?.name || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      if (verifyError.message.toLowerCase().includes("token") || verifyError.message.toLowerCase().includes("invalid")) {
        setError("Invalid OTP. Please check the code and try again.");
      } else {
        setError(verifyError.message);
      }
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setResendSuccess(true);
      setCountdown(60);
    }
    setResendLoading(false);
  };

  if (!email) return null;

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
              Almost there! Just one more step.
            </h2>
            <ul className="auth-page__brand-perks">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Account created successfully
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Verification email sent
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                Confirm your email
              </li>
            </ul>
          </div>
        </div>

        {/* Right — Verify Side */}
        <div className="auth-page__form-wrap">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="auth-page__form-container"
          >
            <div className="auth-page__form-header" style={{ textAlign: "center" }}>
              {/* Email icon */}
              <div style={{ margin: "0 auto 16px", width: "64px", height: "64px", borderRadius: "16px", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1 className="auth-page__form-title">Check your email</h1>
              <p className="auth-page__form-subtitle">
                We sent a 6-digit verification code to
              </p>
              <p style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: "15px", marginTop: "4px" }}>
                {email}
              </p>
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: "14px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "10px", marginBottom: "8px", textAlign: "center" }}>
                {error}
              </div>
            )}

            {resendSuccess && (
              <div style={{ color: "#22c55e", fontSize: "14px", padding: "10px 14px", background: "rgba(34,197,94,0.08)", borderRadius: "10px", marginBottom: "8px", textAlign: "center" }}>
                Verification email resent successfully!
              </div>
            )}

            <form className="auth-form" onSubmit={handleVerify}>
              {/* OTP Input */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "8px 0 24px" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    style={{
                      width: "48px",
                      height: "56px",
                      textAlign: "center",
                      fontSize: "22px",
                      fontWeight: 600,
                      border: "1px solid var(--color-border-strong)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-surface-raised)",
                      color: "var(--color-ink)",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-ink)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                      e.target.style.boxShadow = "";
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="auth-form__submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email →"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--color-ink-soft)", marginBottom: "8px" }}>
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || resendLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: countdown > 0 ? "var(--color-ink-muted)" : "var(--color-ink)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: countdown > 0 ? "not-allowed" : "pointer",
                  textDecoration: countdown > 0 ? "none" : "underline",
                  textUnderlineOffset: "3px",
                  fontFamily: "inherit",
                }}
              >
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend verification email"}
              </button>
            </div>

            <p className="auth-page__switch" style={{ marginTop: "24px" }}>
              Wrong email?{" "}
              <Link to="/signup" className="auth-page__switch-link">
                Go back
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
