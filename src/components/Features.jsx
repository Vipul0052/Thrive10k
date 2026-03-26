import { motion } from "motion/react";

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
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    title: "Deep Work Logger",
    desc: "Log focused sessions by category — code, design, music, writing. Your running total is always visible. Every hour counts.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    title: "Goal Stack",
    desc: "Max 3 active goals at once. Each has a 'why', a daily minimum, and a deadline. Constraints create clarity.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    title: "Streak Tracker",
    desc: "Don't break the chain. A GitHub-style heatmap for your entire life. Watch the green tiles multiply.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    title: "AI Daily Plan",
    desc: "Every morning, one AI-generated focus list: 'Here are your 3 tasks for today.' No decision fatigue — just execute.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    title: "Morning Digest",
    desc: "7am email: 'You're 847hrs into your goal. Today's plan is ready.' One nudge is all you need to start.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    title: "Accountability Rooms",
    desc: "5 people. Same goal. See each other's hours daily. You won't skip a session knowing they didn't.",
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="features__header"
        >
          <span className="section-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Core Features
          </span>
          <h2 className="section-heading">
            Everything you need to become{" "}
            <span className="serif gradient-text">unstoppable.</span>
          </h2>
          <p className="section-subtext">
            Not another productivity app. Thrive10K is a mastery operating system —
            stripped to the essentials that actually move the needle.
          </p>
        </motion.div>

        <div className="features__grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i * 0.5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="feature-card"
            >
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
