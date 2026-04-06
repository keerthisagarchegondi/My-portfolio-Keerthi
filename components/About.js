/**
 * About.js — Concise narrative + stat cards
 * Short copy, visual emphasis.
 */
import { useInView } from 'react-intersection-observer';
import CountUp       from 'react-countup';
import { motion }    from 'framer-motion';
import { FiTrendingUp, FiLayers, FiDatabase, FiAward } from 'react-icons/fi';
import styles from './About.module.css';

const STATS = [
  { icon: FiTrendingUp, end: 6,   suffix: '+', label: 'Years Exp.',     color: '#04d06d' },
  { icon: FiLayers,     end: 3,   suffix: '',  label: 'Industries',     color: '#4add97' },
  { icon: FiDatabase,   end: 5,   suffix: '+', label: 'Cloud Platforms', color: '#baf269' },
  { icon: FiAward,      end: 100, suffix: '+', label: 'Stakeholders',   color: '#02b85f' },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
};

export default function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section id="about" className="section" aria-labelledby="about-heading">
      <div className="container">
        <motion.div ref={ref} className={styles.grid} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>

          {/* Text column */}
          <div className={styles.text}>
            <motion.p variants={fadeUp} className="section-label">About</motion.p>
            <motion.h2 variants={fadeUp} id="about-heading" className="section-heading">
              Data to <span className="gradient-text">Decisions</span>, at Scale
            </motion.h2>
            <motion.p variants={fadeUp} className={styles.body}>
              From mechanical engineering to enterprise analytics — I&apos;ve
              spent 6+ years building the systems that turn raw data into
              strategic clarity across retail, ed-tech, and manufacturing.
            </motion.p>
            <motion.p variants={fadeUp} className={styles.body}>
              I architect Snowflake pipelines, predictive retention models,
              and Power BI dashboards that executives act on — not just look at.
            </motion.p>

            {/* Education mini-cards */}
            <motion.div variants={fadeUp} className={styles.eduRow}>
              <div className={styles.eduCard}>
                <span className={styles.eduEmoji}>🎓</span>
                <div>
                  <p className={styles.eduTitle}>MS Business Analytics</p>
                  <p className={styles.eduSub}>ASU · W.P. Carey · 2022</p>
                </div>
              </div>
              <div className={styles.eduCard}>
                <span className={styles.eduEmoji}>🎓</span>
                <div>
                  <p className={styles.eduTitle}>B.Tech Mechanical Eng.</p>
                  <p className={styles.eduSub}>SRM University · 2016</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stat cards */}
          <div className={styles.stats}>
            {STATS.map(({ icon: Icon, end, suffix, label, color }, i) => (
              <motion.div key={label} variants={fadeUp} className={styles.statCard} whileHover={{ y: -4 }}>
                <div className={styles.statIcon} style={{ background: `${color}10`, color }}>
                  <Icon size={20} />
                </div>
                <span className={styles.statNum} style={{ color }}>
                  {inView ? <CountUp end={end} duration={2} delay={i * 0.12} suffix={suffix} /> : '0'}
                </span>
                <span className={styles.statLabel}>{label}</span>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
