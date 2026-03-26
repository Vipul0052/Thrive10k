import { motion } from "motion/react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    title: "Deep Work Logger",
    tagline: "Every hour is a brick.",
    desc: "Log focused sessions by category — code, design, music, writing. Tag each session, track duration, and see your total hours climb. Your running total is always visible across every screen, reminding you how far you've come.",
    details: [
      "Start/stop timer with one tap",
      "Tag sessions by category (code, design, writing, music, fitness)",
      "Daily, weekly, and monthly hour breakdowns",
      "Running lifetime total always visible",
      "Export logs as CSV for your records",
    ],
  },
  {
    title: "Goal Stack",
    tagline: "Constraints create clarity.",
    desc: "Max 3 active goals at once. Each goal has a clear 'why', a daily minimum commitment, and a deadline. When you finish one, you unlock the next. This isn't about doing everything — it's about doing the right things.",
    details: [
      "Maximum 3 active goals at any time",
      "Each goal requires a 'why' statement",
      "Set daily minimum hours per goal",
      "Deadlines with countdown timers",
      "Archive completed goals with full history",
    ],
  },
  {
    title: "Streak Tracker",
    tagline: "Don't break the chain.",
    desc: "A GitHub-style heatmap for your entire life. Every day you log at least your minimum, the tile goes green. Miss a day, it stays grey. Your longest streak becomes your badge of honor — protect it like your reputation.",
    details: [
      "GitHub-style contribution heatmap",
      "Current streak counter with milestone badges",
      "Longest streak record permanently displayed",
      "Daily notification when streak is at risk",
      "Year-over-year consistency comparison",
    ],
  },
  {
    title: "AI Daily Plan",
    tagline: "No decision fatigue.",
    desc: "Every morning, Thrive10K's AI looks at your goals, your progress, your upcoming deadlines, and generates exactly 3 tasks for the day. No overthinking — just open the app and execute the plan.",
    details: [
      "AI generates 3 daily tasks each morning",
      "Based on your goals, progress, and deadlines",
      "One-tap to mark tasks complete",
      "Replan button if priorities shift",
      "Weekly review of plan completion rate",
    ],
  },
  {
    title: "Morning Digest",
    tagline: "One nudge is all you need.",
    desc: "At 7am every day, you get a personalized email: your current hour total, your streak status, and today's plan. It's the lightest possible touch to keep you accountable without being annoying.",
    details: [
      "Daily email at your preferred time",
      "Shows current hour total and streak",
      "Today's 3 AI-generated tasks included",
      "Motivational quote tailored to your journey",
      "One-click log directly from email",
    ],
  },
  {
    title: "Accountability Rooms",
    tagline: "Your crew won't let you quit.",
    desc: "Create or join a room of 2–5 people working toward the same kind of goal. See each other's daily hours, streaks, and progress. You won't skip a session knowing they didn't.",
    details: [
      "Small groups of 2–5 people",
      "Shared daily activity feed",
      "Group streak milestones",
      "In-app encouragement messages",
      "Weekly group leaderboard",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="page-hero__content"
          >
            <span className="section-eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Features
            </span>
            <h1 className="page-hero__heading">
              Six tools. <span className="serif gradient-text">Zero fluff.</span>
            </h1>
            <p className="page-hero__subtext">
              Every feature exists for one reason: to help you reach 10,000 hours
              of deliberate practice. Nothing extra. Nothing missing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="features-page">
        <div className="container">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i * 0.3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              className={`feature-detail ${i % 2 !== 0 ? "feature-detail--alt" : ""}`}
            >
              <div className="feature-detail__text">
                <span className="feature-detail__number serif">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="feature-detail__title">{feature.title}</h2>
                <p className="feature-detail__tagline serif">{feature.tagline}</p>
                <p className="feature-detail__desc">{feature.desc}</p>
                <ul className="feature-detail__list">
                  {feature.details.map((d) => (
                    <li key={d} className="feature-detail__list-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="feature-detail__visual">
                <div className="feature-detail__mockup">
                  <div className="feature-detail__mockup-dots">
                    <span /><span /><span />
                  </div>
                  <div className="feature-detail__mockup-content">
                    <div className="feature-detail__mockup-title">{feature.title}</div>
                    <div className="feature-detail__mockup-bars">
                      {[75, 60, 90, 45, 80].map((w, j) => (
                        <div key={j} className="feature-detail__mockup-bar" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="page-cta">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="page-cta__inner"
          >
            <h2 className="page-cta__heading">
              Ready to start tracking?
            </h2>
            <p className="page-cta__text">
              Your first hour is free. No credit card needed.
            </p>
            <Link to="/" className="page-cta__btn">
              Start for Free →
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
