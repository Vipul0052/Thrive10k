import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const beliefs = [
  "You don't need a trust fund to build something legendary.",
  "Mastery isn't talent — it's 10,000 hours of showing up.",
  "The broke have hunger. Hunger is the greatest advantage.",
  "One hour a day for 27 years is 10,000 hours. Start today.",
  "Your streak is your identity. Protect it like your reputation.",
  "The system should be invisible. The work should be everything.",
];

export default function Manifesto() {
  return (
    <section className="manifesto" id="manifesto">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="manifesto__header"
        >
          <span className="section-eyebrow section-eyebrow--light">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>
            </svg>
            Our Manifesto
          </span>
          <h2 className="manifesto__heading">
            Built for the ones who{" "}
            <span className="serif" style={{ fontWeight: 400 }}>
              start with nothing.
            </span>
          </h2>
        </motion.div>

        <div className="manifesto__beliefs">
          {beliefs.map((belief, i) => (
            <motion.div
              key={i}
              custom={i * 0.5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="manifesto__belief"
            >
              <span className="manifesto__belief-number serif">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="manifesto__belief-text">{belief}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={1}
          className="manifesto__quote"
        >
          <blockquote className="manifesto__blockquote">
            <p className="serif">
              "The hours you invest in yourself are the only currency that
              compounds forever."
            </p>
            <footer>— The Thrive10K Team</footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
