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

const beliefs = [
  {
    title: "The 10,000 Hour Rule is real.",
    desc: "Malcolm Gladwell popularized it. K. Anders Ericsson studied it. We built a system around it. 10,000 hours of deliberate practice is the threshold where good becomes world-class.",
  },
  {
    title: "You don't need money to start.",
    desc: "The most powerful resource you have is time. One hour of focused practice costs nothing but discipline. We built Thrive10K free because the broke deserve tools as good as the privileged.",
  },
  {
    title: "Consistency beats intensity.",
    desc: "One hour every day for 27 years is 10,000 hours. Three hours every day gets you there in 9 years. The secret isn't working harder — it's never stopping.",
  },
  {
    title: "You need a system, not motivation.",
    desc: "Motivation fades by Tuesday. A system — daily plans, streak tracking, accountability — makes mastery automatic. You don't rise to the level of your goals. You fall to the level of your systems.",
  },
  {
    title: "Small groups beat solo ambition.",
    desc: "A crew of 3–5 people working toward the same goal creates a force field of accountability. You won't skip a session knowing your crew didn't.",
  },
  {
    title: "Track obsessively. Share selectively.",
    desc: "Your hours are yours. Track everything privately, share only what you choose. The heatmap doesn't lie — and you only need to prove things to yourself.",
  },
];

const timeline = [
  {
    date: "January 2025",
    title: "The idea",
    desc: "Frustrated with cluttered productivity apps, the idea for a pure mastery tracker was born — something that only cared about hours and consistency.",
  },
  {
    date: "March 2025",
    title: "First prototype",
    desc: "A simple timer + counter. No design, no features. Just: start, stop, see total hours. It was ugly but it worked — and it changed everything.",
  },
  {
    date: "June 2025",
    title: "Streak tracking added",
    desc: "The GitHub-style heatmap changed the game. Seeing tiles fill up created an addictive loop — nobody wanted to break the chain.",
  },
  {
    date: "September 2025",
    title: "AI daily plans",
    desc: "Instead of deciding what to work on, the AI would just tell you. Three tasks, every morning. Decision fatigue disappeared.",
  },
  {
    date: "December 2025",
    title: "Accountability rooms",
    desc: "Small groups of 2–5 people sharing daily progress. Completion rates jumped 340% for users in rooms versus solo trackers.",
  },
  {
    date: "2026",
    title: "Thrive10K launches",
    desc: "The full mastery operating system goes live. Free forever for individual trackers. Because everyone deserves the tools to build something legendary.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero page-hero--dark">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="page-hero__content"
          >
            <span className="section-eyebrow section-eyebrow--light">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>
              </svg>
              Our Story
            </span>
            <h1 className="page-hero__heading page-hero__heading--light">
              Built for the ones who{" "}
              <span className="serif" style={{ fontWeight: 400 }}>
                start with nothing.
              </span>
            </h1>
            <p className="page-hero__subtext page-hero__subtext--light">
              Thrive10K exists because mastery shouldn't be a privilege.
              Every ambitious person deserves a system that respects their time
              and tracks the only thing that matters — hours invested in getting better.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="about-mission">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="about-mission__inner"
          >
            <div className="about-mission__stat-group">
              <div className="about-mission__stat">
                <div className="about-mission__stat-value serif">10,000</div>
                <div className="about-mission__stat-label">hours to mastery</div>
              </div>
              <div className="about-mission__stat">
                <div className="about-mission__stat-value serif">27</div>
                <div className="about-mission__stat-label">years at 1hr/day</div>
              </div>
              <div className="about-mission__stat">
                <div className="about-mission__stat-value serif">9</div>
                <div className="about-mission__stat-label">years at 3hrs/day</div>
              </div>
            </div>
            <p className="about-mission__text">
              The math is simple. The execution is everything.
              Thrive10K is the operating system that turns those
              numbers from abstract to inevitable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="about-beliefs">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="about-beliefs__header"
          >
            <h2 className="section-heading">
              What we <span className="serif gradient-text">believe</span>
            </h2>
          </motion.div>

          <div className="about-beliefs__grid">
            {beliefs.map((belief, i) => (
              <motion.div
                key={i}
                custom={i * 0.3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeUp}
                className="belief-card"
              >
                <span className="belief-card__number serif">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="belief-card__title">{belief.title}</h3>
                <p className="belief-card__desc">{belief.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="about-timeline__header"
          >
            <h2 className="section-heading">
              The <span className="serif gradient-text">journey</span>
            </h2>
            <p className="section-subtext">
              From a frustration to a movement — here's how Thrive10K came to life.
            </p>
          </motion.div>

          <div className="about-timeline__items">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                custom={i * 0.3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeUp}
                className="timeline-item"
              >
                <div className="timeline-item__dot" />
                <div className="timeline-item__content">
                  <span className="timeline-item__date">{item.date}</span>
                  <h3 className="timeline-item__title">{item.title}</h3>
                  <p className="timeline-item__desc">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="about-quote">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="about-quote__inner"
          >
            <blockquote className="about-quote__block">
              <p className="about-quote__text serif">
                "The hours you invest in yourself are the only currency
                that compounds forever."
              </p>
            </blockquote>
          </motion.div>
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
              Your journey starts now.
            </h2>
            <p className="page-cta__text">
              Join 1,020+ builders tracking their mastery. Free forever.
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
