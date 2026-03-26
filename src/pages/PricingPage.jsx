import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const plans = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Everything you need to start tracking your mastery journey.",
    features: [
      "Hour logging (unlimited)",
      "3 active goals",
      "Streak tracker + heatmap",
      "Basic daily plan",
      "Community access",
    ],
    notIncluded: [
      "AI-powered daily plans",
      "Morning email digest",
      "Streak break alerts",
      "Weekly review reports",
      "Priority support",
    ],
    cta: "Start for Free",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Obsessed",
    price: "$9",
    period: "/month",
    description: "For the ones who are serious about the 10,000 hour journey.",
    features: [
      "Everything in Starter",
      "AI-powered daily plans",
      "Morning email digest",
      "Streak break alerts",
      "Weekly review reports",
      "AI replan button",
      "Priority support",
    ],
    notIncluded: [
      "Team accountability rooms",
      "Group leaderboards",
      "Admin analytics",
    ],
    cta: "Get Obsessed",
    highlighted: true,
  },
  {
    id: "team",
    name: "Crew",
    price: "$29",
    period: "/month",
    description: "Accountability rooms for teams chasing mastery together.",
    features: [
      "Everything in Obsessed",
      "Up to 25 members",
      "Group accountability rooms",
      "Team leaderboards",
      "Admin analytics",
      "Custom integrations",
      "Dedicated support",
    ],
    notIncluded: [],
    cta: "Build Your Crew",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Can I really use Thrive10K for free?",
    a: "Yes. The Starter plan is free forever — no credit card, no trial period, no catch. You get unlimited hour logging, 3 active goals, streak tracking, and community access. Upgrade only when you want AI superpowers.",
  },
  {
    q: "What counts as an 'hour' in Thrive10K?",
    a: "Any focused, deliberate practice session. Coding, writing, designing, studying, playing an instrument, training — if you're intentionally working to improve, it counts. Passive activities (watching tutorials without practicing) don't count.",
  },
  {
    q: "Why only 3 active goals?",
    a: "Constraints create clarity. Research shows that pursuing more than 3 goals simultaneously reduces your chances of completing any of them. Finish one, unlock the next. This is about depth, not breadth.",
  },
  {
    q: "How does the AI daily plan work?",
    a: "Each morning, our AI analyzes your active goals, current progress, upcoming deadlines, and recent patterns. It generates exactly 3 tasks that will move you forward the most. If priorities shift, hit the replan button.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade, downgrade, or cancel anytime. If you downgrade from Obsessed to Starter, you keep all your logged hours and streaks — you just lose access to AI features and email digests.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. All data is encrypted in transit and at rest. We never sell your data. You can export everything as CSV at any time, and delete your account with one click.",
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
      <button className="faq-item__question" onClick={onToggle}>
        <span>{faq.q}</span>
        <svg
          className="faq-item__chevron"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="faq-item__answer">
        <p>{faq.a}</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

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
            className="page-hero__content page-hero__content--center"
          >
            <span className="section-eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" transform="rotate(45 12 12)"/>
              </svg>
              Pricing
            </span>
            <h1 className="page-hero__heading" style={{ textAlign: "center" }}>
              Start free. <span className="serif gradient-text">Scale when ready.</span>
            </h1>
            <p className="page-hero__subtext" style={{ textAlign: "center", maxWidth: 520 }}>
              The best things in life are free — including tracking your first
              10,000 hours. Upgrade when you want the AI superpowers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-page">
        <div className="container">
          <div className="pricing__grid">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                custom={i * 0.5}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeUp}
                className={`pricing-card ${plan.highlighted ? "pricing-card--highlighted" : ""}`}
              >
                {plan.highlighted && (
                  <div className="pricing-card__badge">Most Popular</div>
                )}
                <div className="pricing-card__top">
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <div className="pricing-card__price">
                    <span className="pricing-card__amount serif">{plan.price}</span>
                    <span className="pricing-card__period">{plan.period}</span>
                  </div>
                  <p className="pricing-card__desc">{plan.description}</p>
                </div>
                <ul className="pricing-card__features">
                  {plan.features.map((f) => (
                    <li key={f} className="pricing-card__feature">
                      <svg className="pricing-card__check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="pricing-card__feature pricing-card__feature--disabled">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`pricing-card__cta ${plan.highlighted ? "pricing-card__cta--primary" : ""}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="comparison__header"
          >
            <h2 className="section-heading" style={{ textAlign: "center" }}>
              Compare <span className="serif gradient-text">plans</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            custom={1}
            className="comparison__table-wrap"
          >
            <table className="comparison__table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th className="comparison__highlight-col">Obsessed</th>
                  <th>Crew</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Hour logging", "Unlimited", "Unlimited", "Unlimited"],
                  ["Active goals", "3", "Unlimited", "Unlimited"],
                  ["Streak tracker", true, true, true],
                  ["Heatmap", true, true, true],
                  ["AI daily plan", false, true, true],
                  ["Morning digest email", false, true, true],
                  ["Streak break alerts", false, true, true],
                  ["Weekly review", false, true, true],
                  ["AI replan", false, true, true],
                  ["Accountability rooms", false, false, "Up to 25"],
                  ["Team leaderboard", false, false, true],
                  ["Admin analytics", false, false, true],
                  ["Custom integrations", false, false, true],
                  ["Support", "Community", "Priority", "Dedicated"],
                ].map(([feature, starter, obsessed, crew]) => (
                  <tr key={feature}>
                    <td className="comparison__feature-name">{feature}</td>
                    {[starter, obsessed, crew].map((val, i) => (
                      <td key={i} className={i === 1 ? "comparison__highlight-col" : ""}>
                        {val === true ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : val === false ? (
                          <span className="comparison__dash">—</span>
                        ) : (
                          <span className="comparison__text">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="faq__header"
          >
            <h2 className="section-heading">
              Frequently asked <span className="serif gradient-text">questions</span>
            </h2>
            <p className="section-subtext">
              Everything you need to know before starting your mastery journey.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            custom={1}
            className="faq__list"
          >
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
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
              Your first hour starts now.
            </h2>
            <p className="page-cta__text">
              Join 1,020+ ambitious builders. Free forever — no credit card needed.
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
