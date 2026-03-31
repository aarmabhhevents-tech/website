import { useEffect, useState } from "react";
import MasonryGrid from "../Components/MasonryGrid/MasonryGrid";
import styles from "./Gallery.module.css";

const categories = ["All", "Wedding", "Birthday", "Corporate"];

export default function Gallery() {
  const [active, setActive] = useState("All");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const qs = active === "All" ? "" : `?category=${encodeURIComponent(active)}`;
        const res = await fetch(`/api/gallery${qs}`);
        const data = await res.json();
        if (!cancelled) setImages(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [active]);

  return (
    <div className={styles.page}>

      {/* ── Hero — FIXED: was missing, now matches other page heroes ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Our Work</span>
          <h1 className={styles.heroTitle}>
            Moments We've<br /><em>Brought to Life</em>
          </h1>
          <div className={styles.goldRule} />
          <p className={styles.heroSub}>
            A curated collection of celebrations we've had the honour of planning —
            each one a story of joy, elegance, and careful craftsmanship.
          </p>
        </div>
      </section>

      {/* ── Gallery body ── */}
      <section className={styles.body}>

        <div className={styles.filters}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={active === cat ? styles.active : ""}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <p className={styles.countBadge}>
          {loading ? "Loading…" : `${images.length} moments captured`}
        </p>

        <MasonryGrid images={images} />

      </section>
    </div>
  );
}