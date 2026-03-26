import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
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
    ],
    cta: "Build Your Crew",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
          className="pricing__header"
        >
          <span className="section-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" transform="rotate(45 12 12)"/>
            </svg>
            Pricing
          </span>
          <h2 className="section-heading">
            Start free. <span className="serif gradient-text">Scale when ready.</span>
          </h2>
          <p className="section-subtext">
            The best things in life are free — including tracking your first
            10,000 hours. Upgrade when you want the AI superpowers.
          </p>
        </motion.div>

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
  );
}
