import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CTA() {
  return (
    <section className="cta-section" id="cta">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="cta-section__inner"
        >
          <h2 className="cta-section__heading">
            Your first hour starts{" "}
            <span className="serif" style={{ fontWeight: 400 }}>
              now.
            </span>
          </h2>
          <p className="cta-section__text">
            Join 1,020+ ambitious builders tracking their mastery. Free forever
            — no credit card, no catch. Just your commitment.
          </p>
          <div className="cta-section__input-group">
            <input
              type="email"
              placeholder="your@email.com"
              className="cta-section__input"
            />
            <button className="cta-section__btn">Start for Free →</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
