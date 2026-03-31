import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Services.module.css'
import { apiFetch } from '../admin/lib/api'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await apiFetch('/api/services')
        if (!cancelled) {
          // Filter for active services only, transform data
          const transformed = Array.isArray(data)
            ? data
                .filter(s => s.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(s => ({
                  _id: s._id,
                  number: String(s.number).padStart(2, '0'),
                  icon: s.icon,
                  title: s.title,
                  desc: s.description,
                }))
            : []
          setServices(transformed)
        }
      } catch (e) {
        console.error('Failed to load services:', e)
        if (!cancelled) setServices([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>What We Offer</span>
          <h1 className={styles.heroTitle}>
            Our <em>Services</em>
          </h1>
          <div className={styles.goldRule} />
          <p className={styles.heroSub}>
            From intimate gatherings to grand celebrations, we provide end-to-end coordination
            that transforms your vision into a flawlessly executed reality.
          </p>
        </div>
      </section>

      {/* ── Services List ── */}
      <section className={styles.list}>
        <div className={styles.listInner}>
          {services.map((s, i) => (
            <div key={i} className={styles.serviceRow}>
              <div className={styles.serviceLeft}>
                <span className={styles.serviceNum}>{s.number}</span>
              </div>
              <div className={styles.serviceMiddle}>
                <span className={styles.serviceIcon}>{s.icon}</span>
                <div className={styles.serviceLine} />
                <h2 className={styles.serviceTitle}>{s.title}</h2>
                <p className={styles.serviceDesc}>{s.desc}</p>
              </div>
              <div className={styles.serviceRight}>
                <div className={styles.serviceAccent} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <span className={styles.eyebrow}>Ready to Begin?</span>
          <h2 className={styles.ctaTitle}>Let's Plan Your<br /><em>Perfect Event</em></h2>
          <div className={styles.goldRule} />
          <p className={styles.ctaText}>
            Reach out and let us take it from here — one conversation is all it takes to get started.
          </p>
          <Link to="/contact" className={styles.ctaBtn}>
            <span>Get in Touch</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

    </div>
  )
}