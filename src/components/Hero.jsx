import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  return (
    <section className="hero" id="hero">
      {/* ── Background Video ── */}
      <div className="hero__video-wrap">
        <video autoPlay muted loop playsInline className="hero__video">
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero__video-overlay" />
      </div>

      {/* ── Hero Content ── */}
      <div className="hero__content container">
        {/* Eyebrow */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <span className="hero__eyebrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            10,000 Hours to Mastery
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp} className="hero__heading">
          Build your{" "}
          <span className="hero__heading-accent serif">legendary</span>
          <br />
          life. One hour at a time.
        </motion.h1>

        {/* Description */}
        <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="hero__description">
          Thrive10K is your personalised mastery tracker — goals, deep work sessions,
          habits, and study streaks — built for the broke, the ambitious, and the obsessed.
        </motion.p>

        {/* Email CTA */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="hero__cta-block">
          <div className="hero__input-group">
            <input type="email" placeholder="your@email.com" className="hero__input" />
            <button className="hero__cta-btn">Start for Free →</button>
          </div>

          {/* Social proof */}
          <div className="hero__social-proof">
            <div className="hero__avatars">
              {[
                { bg: "linear-gradient(135deg, #f5e6d3, #e8c9a8)", initials: "AS" },
                { bg: "linear-gradient(135deg, #d3e6f5, #a8c9e8)", initials: "MK" },
                { bg: "linear-gradient(135deg, #e6f5d3, #c9e8a8)", initials: "RJ" },
                { bg: "linear-gradient(135deg, #f5d3e6, #e8a8c9)", initials: "PL" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="hero__avatar"
                  style={{
                    background: a.bg,
                    marginLeft: i === 0 ? 0 : "-8px",
                  }}
                >
                  <span className="hero__avatar-initials">{a.initials}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="hero__stars">
                {[1, 2, 3, 4].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                {/* Half star */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="none">
                  <defs>
                    <clipPath id="halfStar">
                      <rect x="0" y="0" width="12" height="24"/>
                    </clipPath>
                  </defs>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#e5e7eb"/>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#f59e0b" clipPath="url(#halfStar)"/>
                </svg>
              </div>
              <span className="hero__social-text">1,020+ dreamers already tracking</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="hero__stats">
          {[
            { label: "Hours tracked", value: "2.4M+" },
            { label: "Goals crushed", value: "18K" },
            { label: "Avg streak", value: "47 days" },
          ].map((s) => (
            <div key={s.label} className="hero__stat">
              <div className="hero__stat-value serif">{s.value}</div>
              <div className="hero__stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
