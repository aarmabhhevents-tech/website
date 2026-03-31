import { useState } from 'react'
import styles from './Contact.module.css'

const faqs = [
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 6–12 months in advance for large events like weddings, and 3–6 months for smaller gatherings to ensure availability.' },
  { q: 'What types of events do you plan?', a: 'We plan a wide range of events including weddings, engagements, corporate events, birthdays, baby showers, and social celebrations.' },
  { q: 'Do you offer destination event planning?', a: 'Yes! We offer full destination event planning services across India and select international locations.' },
  { q: 'What is included in your packages?', a: 'Our packages typically include venue scouting, vendor coordination, décor planning, on-day management, and post-event wrap-up.' },
  { q: 'Can I customize my package?', a: 'Absolutely. All our packages are fully customizable to suit your vision, budget, and requirements.' },
  { q: 'How do I get a quote?', a: 'Simply fill out the contact form on this page and our team will get back to you within 24–48 hours with a detailed proposal.' },
]

const eventTypes = [
  'Wedding', 'Engagement', 'Corporate Event',
  'Birthday Party', 'Baby Shower', 'Anniversary',
  'Social Gathering', 'Other',
]

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', eventType: '', message: '',
  })
  const [openFaq, setOpenFaq] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to submit inquiry')
      }

      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', eventType: '', message: '' })
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit inquiry')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i)

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Get in Touch</span>
          <h1 className={styles.heroTitle}>
            Let's Start Planning<br /><em>Your Event</em>
          </h1>
          <div className={styles.goldRule} />
          <p className={styles.heroSub}>
            Have questions or ready to start planning? Fill out the form below and our team
            will get back to you within 24–48 hours with a tailored proposal.
          </p>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section className={styles.body}>
        <div className={styles.bodyInner}>

          {/* Left — info panel */}
          <div className={styles.left}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Call Us</span>
              <a className={styles.infoLink} href="tel:+919599129634">
                +91 95991 29634
              </a>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Follow Us</span>
              <div className={styles.socials}>
                <a href="https://instagram.com" className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="https://facebook.com" className={styles.socialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            <div className={styles.imgWrap}>
              <img
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80"
                alt="Elegant event setup"
              />
              <div className={styles.imgOverlay} />
            </div>
          </div>

          {/* Right — form */}
          <div className={styles.right}>
            <h2 className={styles.formHeading}>Send Us a Message</h2>
            <div className={styles.formRule} />

            {submitted && (
              <div className={styles.success}>
                <span>✓</span> Message sent — we'll be in touch soon.
              </div>
            )}

            {submitError && (
              <div className={styles.success} style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                <span>!</span> {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>First Name <span className={styles.req}>*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Last Name <span className={styles.req}>*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Email <span className={styles.req}>*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label>Phone <span className={styles.req}>*</span></label>
                  <input type="tel" name="phone" placeholder="+91" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className={styles.field}>
                <label>Event Type <span className={styles.req}>*</span></label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                  <option value="">Select an option</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Message <span className={styles.req}>*</span></label>
                <textarea name="message" rows="6" value={formData.message} onChange={handleChange} required />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                <span>{submitting ? 'Sending…' : 'Send Message'}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faq}>
        <div className={styles.faqInner}>
          <span className={styles.eyebrowGold}>FAQ</span>
          <h2 className={styles.faqTitle}>Frequently Asked <em>Questions</em></h2>
          <div className={styles.goldRule} />
          <div className={styles.faqGrid}>
            <div>
              {faqs.slice(0, 3).map((faq, i) => (
                <div key={i} className={styles.faqItem}>
                  <button className={styles.faqQuestion} onClick={() => toggleFaq(i)}>
                    <span>{faq.q}</span>
                    <span className={`${styles.faqIcon} ${openFaq === i ? styles.faqIconOpen : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </span>
                  </button>
                  {openFaq === i && <p className={styles.faqAnswer}>{faq.a}</p>}
                  <div className={styles.faqDivider} />
                </div>
              ))}
            </div>
            <div>
              {faqs.slice(3).map((faq, i) => (
                <div key={i + 3} className={styles.faqItem}>
                  <button className={styles.faqQuestion} onClick={() => toggleFaq(i + 3)}>
                    <span>{faq.q}</span>
                    <span className={`${styles.faqIcon} ${openFaq === i + 3 ? styles.faqIconOpen : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </span>
                  </button>
                  {openFaq === i + 3 && <p className={styles.faqAnswer}>{faq.a}</p>}
                  <div className={styles.faqDivider} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Contact