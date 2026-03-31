import styles from './NotFound.module.css'

function NotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.script}>Page not found</p>
          <h1 className={styles.title}>
            404 <em>NOT FOUND</em>
          </h1>
          <p className={styles.body}>
            The page you&apos;re looking for doesn&apos;t exist or may have been moved. Please use
            the navigation to continue exploring Aarambhh Events.
          </p>
        </div>
      </section>
    </div>
  )
}

export default NotFound

