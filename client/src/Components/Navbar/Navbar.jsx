import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/logoNoBG.png'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`

  return (
    <div className={styles.navWrapper}>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.left}>
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/gallery" className={linkClass}>
            Gallery
          </NavLink>
        </div>

        <div className={styles.logoBlock}>
          <Link to="/" className={styles.brandLink}>
            <img src={logo} alt="Aarambhh Events Logo" />
          </Link>
        </div>

        <div className={styles.right}>
          <NavLink to="/services" className={linkClass}>
            Services
          </NavLink>
          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </div>
      </nav>
    </div>
  )
}