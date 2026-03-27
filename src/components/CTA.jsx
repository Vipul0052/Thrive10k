import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CTA() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleStart = (e) => {
    e.preventDefault();
    if (email) {
      navigate(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      navigate("/signup");
    }
  };

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
          <form onSubmit={handleStart} className="cta-section__input-group">
            <input
              type="email"
              placeholder="your@email.com"
              className="cta-section__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="cta-section__btn">Start for Free →</button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
