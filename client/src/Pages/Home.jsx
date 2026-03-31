import { Link } from 'react-router-dom'
import Hero from '../Components/Hero/Hero'
import styles from './Home.module.css'
import aboutImg from '../assets/aboutPreview2.jpg'

const services = [
  {
    number: '01',
    title: 'Weddings',
    desc: 'From intimate ceremonies to grand celebrations — every detail curated with devotion.',
  },
  {
    number: '02',
    title: 'Corporate',
    desc: 'Sophisticated gatherings that leave lasting impressions on clients and teams alike.',
  },
  {
    number: '03',
    title: 'Social Events',
    desc: 'Birthdays, anniversaries, and milestones transformed into cherished memories.',
  },
]

function Home() {
  return (
    <div className={styles.page}>
      <Hero />

      {/* ── About Preview ── */}
      <section className={styles.about}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutImageWrap}>
            <div className={styles.imageFrame}>
              <img src={aboutImg} alt="Elegant event" className={styles.aboutImg} />
            </div>
            <div className={styles.imageAccent} />
          </div>

          <div className={styles.aboutContent}>
            <span className={styles.eyebrow}>Our Story</span>
            <h2 className={styles.aboutTitle}>
              We Turn <em>Visions</em><br />Into Reality
            </h2>
            <div className={styles.goldRule} />
            <p className={styles.aboutDesc}>
              Aarambhh Events is dedicated to designing and executing elegant, 
              well-orchestrated celebrations. We combine thoughtful planning with 
              creative design to bring your vision to life — precisely, beautifully, 
              and unforgettably.
            </p>
            <Link to="/about" className={styles.btn}>
              <span>Discover Our Story</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Services Strip ── */}
      <section className={styles.services}>
        <div className={styles.servicesInner}>
          <span className={styles.eyebrowLight}>What We Do</span>
          <h2 className={styles.servicesTitle}>Crafting Every Detail</h2>
          <div className={styles.servicesList}>
            {services.map((s) => (
              <div key={s.number} className={styles.serviceCard}>
                <span className={styles.serviceNum}>{s.number}</span>
                <div className={styles.serviceDivider} />
                <h3 className={styles.serviceName}>{s.title}</h3>
                <p className={styles.serviceDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <span className={styles.ctaScript}>Let's Begin</span>
          <h2 className={styles.ctaTitle}>Your Perfect Event<br />Starts Here</h2>
          <Link to="/contact" className={styles.ctaBtn}>
            Start Planning
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home