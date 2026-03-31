import { NavLink } from 'react-router-dom'
import styles from './Footer.module.css'

const leftLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
]

const rightLinks = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/events', label: 'Events' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`

  const email = 'hello@aarambhhevents.com'
  const phoneDisplay = '+91 95991 29634'
  const phoneTel = '+919599129634'

  return (
    <footer className={styles.footer}>

      {/* Top gold rule */}
      <div className={styles.topRule} />

      <div className={styles.inner}>

        {/* Left nav */}
        <nav className={styles.navLeft} aria-label="Footer navigation left">
          {leftLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Center brand */}
        <div className={styles.center}>
          <div className={styles.brandName}>Aarambhh Events</div>

          <div className={styles.goldDivider} />

          <div className={styles.socials}>
            {/* Instagram */}
            <a href="https://instagram.com" className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" className={styles.socialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>

          <div className={styles.contact}>
            <a className={styles.contactLink} href={`mailto:${email}`}>{email}</a>
            <a className={styles.contactLink} href={`tel:${phoneTel}`}>{phoneDisplay}</a>
          </div>
        </div>

        {/* Right nav */}
        <nav className={styles.navRight} aria-label="Footer navigation right">
          {rightLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Aarambhh Events. All rights reserved.</span>
      </div>
    </footer>
  )
}