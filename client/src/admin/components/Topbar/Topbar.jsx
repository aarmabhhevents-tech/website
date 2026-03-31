import styles from './Topbar.module.css'

export default function Topbar({ title, subtitle }) {
  return (
    <div className={styles.topbar}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.avatar}>A</div>
    </div>
  )
}