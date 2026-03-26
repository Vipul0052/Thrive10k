import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function TermsPage() {
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
            <h1 className="page-hero__heading">Terms of Service</h1>
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
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Thrive10K ("the Service"), you agree to be bound
              by these Terms of Service. If you do not agree, please do not use
              the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Thrive10K is a mastery tracking platform that helps users log
              deliberate practice hours, set goals, track streaks, and receive
              AI-generated daily plans. The Service is available through our web
              application.
            </p>

            <h2>3. Account Registration</h2>
            <p>To use Thrive10K, you must:</p>
            <ul>
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2>4. Free and Paid Plans</h2>
            <p>
              Thrive10K offers a free Starter plan and paid plans (Obsessed, Crew).
              Free plans are available indefinitely with no credit card required.
              Paid plans are billed monthly and can be cancelled at any time.
            </p>
            <p>
              Upon cancellation of a paid plan, you retain access until the end of
              your current billing period. Your data, logged hours, and streaks are
              never deleted when downgrading.
            </p>

            <h2>5. User Content</h2>
            <p>
              You retain ownership of all data you create within Thrive10K,
              including hour logs, goals, notes, and session data. You grant us
              a limited license to store and process this data solely to provide
              the Service.
            </p>

            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to other accounts</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated tools to scrape or exploit the Service</li>
              <li>Share abusive, harmful, or misleading content in accountability rooms</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              The Thrive10K name, logo, design, and all underlying technology are
              our intellectual property. You may not copy, modify, or distribute
              any part of the Service without written permission.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              Thrive10K is provided "as is" without warranties of any kind. We are
              not liable for any indirect, incidental, or consequential damages
              arising from your use of the Service, including loss of data or
              interruption of service.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these terms.
              You may delete your account at any time from your settings. Upon
              deletion, all personal data is permanently removed within 30 days.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Material
              changes will be communicated via email at least 14 days before
              taking effect.
            </p>

            <h2>11. Contact</h2>
            <p>
              Questions about these terms? Email us at{" "}
              <a href="mailto:legal@thrive10k.com">legal@thrive10k.com</a>.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
