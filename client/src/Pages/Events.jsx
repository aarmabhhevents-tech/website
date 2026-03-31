import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Events.module.css'
import { apiFetch } from '../admin/lib/api'

// Span pattern for masonry grid
const spanPatterns = ['wide', 'tall', 'normal', 'wide', 'normal', 'tall']

export default function Events() {
  const [hovered, setHovered] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await apiFetch('/api/events')
        if (!cancelled) {
          // Filter for active events only, transform data, and apply span pattern
          const transformed = Array.isArray(data)
            ? data
                .filter(ev => ev.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((ev, idx) => ({
                  _id: ev._id,
                  id: ev._id, // Keep id for React key
                  category: ev.category,
                  tag: ev.tag,
                  headline: ev.headline,
                  desc: ev.description,
                  img: ev.image_url,
                  span: spanPatterns[idx % spanPatterns.length],
                }))
            : []
          setEvents(transformed)
        }
      } catch (e) {
        console.error('Failed to load events:', e)
        if (!cancelled) setEvents([])
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
          <span className={styles.eyebrow}>Specialisations</span>
          <h1 className={styles.heroTitle}>
            Events We<br /><em>Live For</em>
          </h1>
          <p className={styles.heroSub}>
            Every celebration deserves to be extraordinary. We specialise in bringing out
            the finest expression of your event — beautifully coordinated, thoughtfully planned,
            and built entirely around you.
          </p>
        </div>

        {/* Decorative scroll cue */}
        <div className={styles.scrollCue}>
          <div className={styles.scrollLine} />
          <span>Explore</span>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className={styles.grid}>
        {events.map((ev) => (
          <div
            key={ev.id}
            className={`${styles.card} ${styles[ev.span]}`}
            onMouseEnter={() => setHovered(ev.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Background image */}
            <div
              className={`${styles.cardBg} ${hovered === ev.id ? styles.cardBgActive : ''}`}
              style={{ backgroundImage: `url(${ev.img})` }}
            />

            {/* Dark gradient overlay */}
            <div className={styles.cardOverlay} />

            {/* Gold border reveal on hover */}
            <div className={`${styles.cardBorder} ${hovered === ev.id ? styles.cardBorderActive : ''}`} />

            {/* Content */}
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <span className={styles.cardTag}>{ev.tag}</span>
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.cardCategory}>{ev.category}</span>
                <h2 className={styles.cardHeadline}>{ev.headline}</h2>
                <p className={`${styles.cardDesc} ${hovered === ev.id ? styles.cardDescVisible : ''}`}>
                  {ev.desc}
                </p>
                <div className={`${styles.cardCta} ${hovered === ev.id ? styles.cardCtaVisible : ''}`}>
                  <Link to="/contact" className={styles.cardLink}>
                    <span>Plan This Event</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Promise strip ── */}
      <section className={styles.stats}>
        <div className={styles.statsInner}>
          {[
            { label: 'Founder-Led Planning' },
            { label: 'Fully Customised' },
            { label: 'End-to-End Coordination' },
            { label: 'One Point of Contact' },
          ].map((s, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statIcon}>✦</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <span className={styles.eyebrow}>Let's Begin</span>
          <h2 className={styles.ctaTitle}>Your Event Deserves<br /><em>the Best</em></h2>
          <div className={styles.goldRule} />
          <p className={styles.ctaText}>
            Tell us about your celebration and we'll take care of everything else.
          </p>
          <Link to="/contact" className={styles.ctaBtn}>
            <span>Start Planning</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

    </div>
  )
}