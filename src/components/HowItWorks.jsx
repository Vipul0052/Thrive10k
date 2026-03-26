import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const steps = [
  {
    number: "01",
    title: "Set your mission",
    desc: "Pick up to 3 goals. Define your 'why'. Set a daily minimum. The system shapes around you.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Log your hours",
    desc: "Start a deep work session. Tag it. End it. Watch your total climb. Every session is a brick.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Follow the plan",
    desc: "Each morning, AI generates your 3 tasks for the day based on your goals and progress. Just execute.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Never break the chain",
    desc: "Your streak is your reputation. The heatmap doesn't lie. Stay consistent and watch mastery compound.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="how-it-works__header"
        >
          <span className="section-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="4" y="4" width="16" height="16" rx="2" transform="rotate(45 12 12)"/>
            </svg>
            The System
          </span>
          <h2 className="section-heading">
            Four steps. <span className="serif gradient-text">Zero noise.</span>
          </h2>
          <p className="section-subtext">
            No bloated dashboards. No gamification fluff. Just a clean system
            that respects your time and tracks what matters.
          </p>
        </motion.div>

        <div className="how-it-works__steps">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="step-card"
            >
              <div className="step-card__icon-wrap">
                {step.icon}
              </div>
              <div className="step-card__number serif">{step.number}</div>
              <h3 className="step-card__title">{step.title}</h3>
              <p className="step-card__desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
