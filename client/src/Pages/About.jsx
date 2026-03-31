import styles from './About.module.css'


const whyUs = [
  { label: 'Mediator-Led Planning', detail: 'One point of contact for all vendors' },
  { label: 'Personalized Coordination', detail: 'Every event tailored to your needs' },
  { label: 'Creative Alignment', detail: 'Elegant and cohesive event concepts' },
  { label: 'End-to-End Management', detail: 'From planning to execution' },
  { label: 'Founder-Led Excellence', detail: 'Personally overseen by Akshit Malhotra' },
]

const mission = [
  'To act as a single point of contact between clients and vendors',
  'To design events that are personal, timeless, and soulful',
  'To deliver stress-free planning and coordination',
  'To ensure transparency, trust, and smooth execution at every stage',
]

export default function About() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Welcome to</span>
          <h1 className={styles.heroTitle}>Aarambhh Events</h1>
          <div className={styles.goldRule} />
          <p className={styles.heroBody}>
            At Aarambhh Events, we believe every celebration marks a new beginning — an <em>Aarambhh</em>.
            We work as your trusted mediator and planning partner, seamlessly connecting your vision
            with the right vendors, creatives, and services to bring your celebration to life.
          </p>
          <p className={styles.heroBodySub}>
            From intimate gatherings to grand affairs, we ensure every detail is thoughtfully coordinated,
            allowing you to enjoy your moments while we manage the planning, communication, and execution
            behind the scenes.
          </p>
        </div>
      </section>

      {/* ── About ── */}
      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <div className={styles.aboutLeft}>
            <span className={styles.eyebrowGold}>About Us</span>
            <h2 className={styles.sectionTitle}>
              A Bridge Between<br /><em>Vision & Reality</em>
            </h2>
            <div className={styles.shortRule} />
            <p className={styles.bodyText}>
              Aarambhh Events is a full-service event management company founded by{' '}
              <strong>Akshit Malhotra</strong>, built on the idea of being a reliable bridge between
              clients and event partners.
            </p>
            <p className={styles.bodyText}>
              What began as a passion for organizing meaningful celebrations has grown into a brand
              known for refined aesthetics, personalized planning, and smooth coordination. We believe
              every event tells a story — and our role is to ensure that story is executed flawlessly
              by aligning the right people, ideas, and resources.
            </p>
            <p className={styles.bodyText}>
              From concept to completion, we handle vendor coordination, timelines, and on-ground
              management — so you can celebrate stress-free.
            </p>
          </div>

          {/* Vision & Mission */}
          <div className={styles.aboutRight}>
            <div className={styles.vmCard}>
              <span className={styles.vmLabel}>Our Vision</span>
              <p className={styles.vmText}>
                To be a trusted event planning mediator known for creating elegant, well-coordinated,
                and memorable celebrations by bringing together creativity, professionalism, and reliability.
              </p>
            </div>

            <div className={styles.vmCard}>
              <span className={styles.vmLabel}>Our Mission</span>
              <ul className={styles.missionList}>
                {mission.map((m, i) => (
                  <li key={i} className={styles.missionItem}>
                    <span className={styles.missionDot} />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className={styles.why}>
        <div className={styles.whyInner}>
          <div className={styles.whyLeft}>
            <span className={styles.eyebrowGold}>Why Us</span>
            <h2 className={styles.sectionTitle}>
              Why Choose<br /><em>Aarambhh Events?</em>
            </h2>
            <div className={styles.shortRule} />
            <p className={styles.bodyText}>
              We don't just coordinate events — we simplify them. Our mediator-led approach means
              you have one calm, reliable point of contact while we orchestrate everything behind the scenes.
            </p>
          </div>
          <div className={styles.whyRight}>
            {whyUs.map((w, i) => (
              <div key={i} className={styles.whyItem}>
                <div className={styles.whyNumber}>0{i + 1}</div>
                <div className={styles.whyText}>
                  <span className={styles.whyLabel}>{w.label}</span>
                  <span className={styles.whyDetail}>{w.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promise ── */}
      <section className={styles.promise}>
        <div className={styles.promiseInner}>
          <span className={styles.eyebrow}>Our Promise</span>
          <h2 className={styles.promiseTitle}>
            We Don't Just Plan Events —<br /><em>We Simplify Them.</em>
          </h2>
          <div className={styles.goldRule} />
          <p className={styles.promiseText}>
            We promise smooth coordination, honest communication, creative planning,
            and celebrations that truly feel effortless for you.
          </p>
        </div>
      </section>

    </div>
  )
}