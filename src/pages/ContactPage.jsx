import { motion } from "motion/react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <span className="section-eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact
            </span>
            <h1 className="page-hero__heading">
              Get in <span className="serif gradient-text">touch</span>
            </h1>
            <p className="page-hero__subtext">
              Have a question, feedback, or partnership idea? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact__grid">
            {/* Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="contact__form-wrap"
            >
              {submitted ? (
                <div className="contact__success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <h3>Message sent!</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form className="contact__form" onSubmit={handleSubmit}>
                  <div className="contact__form-row">
                    <div className="auth-form__field">
                      <label className="auth-form__label" htmlFor="contact-name">Name</label>
                      <input
                        id="contact-name"
                        className="auth-form__input"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="auth-form__field">
                      <label className="auth-form__label" htmlFor="contact-email">Email</label>
                      <input
                        id="contact-email"
                        className="auth-form__input"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="contact-subject">Subject</label>
                    <input
                      id="contact-subject"
                      className="auth-form__input"
                      type="text"
                      placeholder="What's this about?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      className="auth-form__input auth-form__textarea"
                      placeholder="Tell us more..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows="5"
                      required
                    />
                  </div>
                  <button type="submit" className="auth-form__submit">
                    Send Message →
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              custom={1}
              className="contact__info"
            >
              <div className="contact__card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <h4>Email</h4>
                <p>hello@thrive10k.com</p>
              </div>
              <div className="contact__card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <h4>Discord</h4>
                <p>Join our community</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
