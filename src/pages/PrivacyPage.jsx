import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PrivacyPage() {
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
            <h1 className="page-hero__heading">Privacy Policy</h1>
            <p className="page-hero__subtext">
              Last updated: January 1, 2026
            </p>
          </motion.div>
        </div>
      </section>

      <section className="legal-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={fadeUp}
            className="legal-content"
          >
            <h2>1. Information We Collect</h2>
            <p>
              When you create a Thrive10K account, we collect your name, email address,
              and password. We also collect usage data including hours logged, goals
              created, and session timestamps to provide our core service.
            </p>
            <p>
              We do not collect or store payment information directly — all payment
              processing is handled by our third-party provider (Stripe), which has
              its own privacy policy.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve Thrive10K's services</li>
              <li>Generate your AI daily plans and morning digest emails</li>
              <li>Calculate your streaks, heatmaps, and progress statistics</li>
              <li>Send you service-related notifications (streak warnings, etc.)</li>
              <li>Respond to your support requests</li>
            </ul>

            <h2>3. Data Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal data. Period. Your hour
              logs, goals, and progress data are yours. We share data only:
            </p>
            <ul>
              <li>With accountability room members you explicitly invite</li>
              <li>With service providers necessary to operate Thrive10K (hosting, email delivery)</li>
              <li>When required by law or to protect legal rights</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
              We use industry-standard security measures including regular security
              audits, access controls, and monitoring.
            </p>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> — Download all your data as CSV at any time</li>
              <li><strong>Update</strong> — Edit your profile and preferences</li>
              <li><strong>Delete</strong> — Permanently delete your account with one click</li>
              <li><strong>Export</strong> — Take your data with you if you leave</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use essential cookies only — for authentication and session
              management. We do not use tracking cookies, advertising pixels, or
              any third-party analytics that profiles your behavior.
            </p>

            <h2>7. Children's Privacy</h2>
            <p>
              Thrive10K is not intended for users under 13 years of age. We do not
              knowingly collect information from children under 13.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. When we make changes,
              we'll update the "Last updated" date and notify you via email if the
              changes are significant.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a href="mailto:privacy@thrive10k.com">privacy@thrive10k.com</a>.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
