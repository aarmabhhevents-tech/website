import { useState, useEffect, useRef } from "react";
import styles from "./Hero.module.css";

import img1 from "../../assets/heroImg.jpg";
import img2 from "../../assets/heroImg2.jpg";
import img3 from "../../assets/heroImg3.jpeg";
import img4 from "../../assets/heroImg4.jpeg";


const images = [img1, img2, img3, img4];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${images[index]})` }}
    >
      <div className={styles.overlay}></div>

      <button className={`${styles.arrow} ${styles.left}`} onClick={prev}>
        ❮
      </button>

      <button className={`${styles.arrow} ${styles.right}`} onClick={next}>
        ❯
      </button>
    </section>
  );
}
