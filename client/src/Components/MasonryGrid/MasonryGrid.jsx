import styles from "../../Pages/Gallery.module.css";
import { useState } from "react";

export default function MasonryGrid({ images }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className={styles.grid}>
        {images.map((img, i) => (
          <div
            key={img.id}
            className={styles.card}
            style={{ animationDelay: `${i * 0.07}s` }}
            onClick={() => setSelected(img)}
          >
            <img
              src={img.url}
              alt={img.title}
              loading="lazy"
            />
            <div className={styles.overlay}>
              <span className={styles.overlayTitle}>{img.title}</span>
              <span className={styles.overlayLine} />
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.modal} onClick={() => setSelected(null)}>
          <span className={styles.modalClose}>✕ &nbsp;Close</span>
          <img src={selected.url} alt={selected.title} />
        </div>
      )}
    </>
  );
}