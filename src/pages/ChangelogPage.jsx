import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const releases = [
  {
    version: "1.2.0",
    date: "March 20, 2026",
    tag: "Latest",
    changes: [
      { type: "feature", text: "Accountability rooms — invite 2–5 people to your mastery crew" },
      { type: "feature", text: "Group leaderboards with weekly rankings" },
      { type: "improve", text: "Streak tracker now shows month-over-month comparison" },
      { type: "fix", text: "Fixed heatmap rendering on Safari mobile" },
    ],
  },
  {
    version: "1.1.0",
    date: "February 8, 2026",
    tag: "",
    changes: [
      { type: "feature", text: "AI replan button — regenerate your daily tasks anytime" },
      { type: "feature", text: "Morning digest now includes motivational quotes" },
      { type: "improve", text: "Reduced email digest delivery time to under 3 seconds" },
      { type: "improve", text: "Better keyboard shortcuts across the dashboard" },
      { type: "fix", text: "Goal deadline countdown now adjusts for timezone" },
    ],
  },
  {
    version: "1.0.0",
    date: "January 1, 2026",
    tag: "Launch",
    changes: [
      { type: "feature", text: "Deep Work Logger — log focused sessions with categories" },
      { type: "feature", text: "Goal Stack — max 3 active goals with 'why' statements" },
      { type: "feature", text: "Streak Tracker — GitHub-style heatmap for your life" },
      { type: "feature", text: "AI Daily Plan — 3 auto-generated tasks each morning" },
      { type: "feature", text: "Morning Digest — daily email with progress + plan" },
      { type: "feature", text: "CSV Export — download all your logged data" },
    ],
  },
  {
    version: "0.9.0 Beta",
    date: "November 15, 2025",
    tag: "Beta",
    changes: [
      { type: "feature", text: "Public beta launch with 200 early adopters" },
      { type: "feature", text: "Basic timer + session logging" },
      { type: "feature", text: "Goal setting with daily minimums" },
      { type: "improve", text: "Optimized for mobile devices" },
    ],
  },
];

const typeLabels = {
  feature: "New",
  improve: "Improved",
  fix: "Fixed",
};

const typeColors = {
  feature: "#22c55e",
  improve: "#3b82f6",
  fix: "#f59e0b",
};

export default function ChangelogPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="page-hero__content"
          >
            <span className="section-eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Changelog
            </span>
            <h1 className="page-hero__heading">
              What's <span className="serif gradient-text">new</span>
            </h1>
            <p className="page-hero__subtext">
              Every update, improvement, and fix — documented here so you
              always know what's changed.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="changelog">
        <div className="container">
          <div className="changelog__list">
            {releases.map((release, i) => (
              <motion.div
                key={release.version}
                custom={i * 0.3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeUp}
                className="changelog__release"
              >
                <div className="changelog__release-header">
                  <div className="changelog__release-meta">
                    <h2 className="changelog__version serif">v{release.version}</h2>
                    {release.tag && (
                      <span className={`changelog__tag changelog__tag--${release.tag.toLowerCase()}`}>
                        {release.tag}
                      </span>
                    )}
                  </div>
                  <span className="changelog__date">{release.date}</span>
                </div>
                <ul className="changelog__changes">
                  {release.changes.map((change, j) => (
                    <li key={j} className="changelog__change">
                      <span
                        className="changelog__change-type"
                        style={{ color: typeColors[change.type], borderColor: typeColors[change.type] }}
                      >
                        {typeLabels[change.type]}
                      </span>
                      <span className="changelog__change-text">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
