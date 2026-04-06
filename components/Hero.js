/**
 * Hero.js — Two-column hero.
 * LEFT : left-aligned name, typewriter role, tagline, CTAs.
 * RIGHT: Animated analytics dashboard card — SVG bar chart growing from
 *        bottom, staggered bars, sparkline, floating metric chips.
 *        All data science / analytics themed.
 */
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TypeAnimation } from 'react-type-animation';
import { FiArrowRight, FiLinkedin, FiMail, FiTrendingUp, FiAward, FiZap } from 'react-icons/fi';
import styles from './Hero.module.css';

const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false });

/* ── Animation variants ── */
const fadeLeft = {
  hidden:  { opacity: 0, x: -44 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.11, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};
const fadeRight = {
  hidden:  { opacity: 0, x: 64, scale: 0.93 },
  visible: { opacity: 1, x: 0, scale: 1,
    transition: { delay: 0.28, duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Bar chart data (weekly model performance) ── */
const BARS = [
  { pct: 44, color: '#3a3b3d' },
  { pct: 59, color: '#444649' },
  { pct: 48, color: '#3a3b3d' },
  { pct: 76, color: '#4e5054' },
  { pct: 63, color: '#444649' },
  { pct: 94, color: null },     // peak — uses gradient
  { pct: 70, color: '#3a3b3d' },
  { pct: 82, color: '#444649' },
];
const SVG_H = 108;
const BAR_W = 20;
const GAP   = 9;
const STEP  = BAR_W + GAP;
const SVG_W = BARS.length * STEP - GAP;

/* ── Floating metric chips ── */
const FLOATS = [
  { val: '+28%',  label: 'Campaign ROI',  Icon: FiTrendingUp, color: '#04d06d',
    pos: { top: '-1rem', right: '-1.1rem' }, delay: 0.72 },
  { val: '18%↓',  label: 'Churn Reduced', Icon: FiAward,      color: '#baf269',
    pos: { bottom: '3rem', left: '-1.5rem' }, delay: 0.9 },
  { val: '94%',   label: 'Accuracy',      Icon: FiZap,        color: '#4add97',
    pos: { bottom: '-0.7rem', right: '1.1rem' }, delay: 1.08 },
];

/* ─── Analytics card (right panel) ─── */
function AnalyticsCard() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.25 });

  return (
    <div ref={ref} className={styles.vizWrap}>

      {/* Floating metric chips */}
      {FLOATS.map(({ val, label, Icon, color, pos, delay }, fi) => (
        <motion.div
          key={fi}
          className={styles.floatChip}
          style={{ ...pos, borderColor: 'rgba(255,255,255,0.1)' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={inView
            ? { opacity: 1, scale: 1, y: [0, -6, 0] }
            : { opacity: 0, scale: 0.5 }
          }
          transition={{
            opacity: { delay, duration: 0.38 },
            scale:   { delay, type: 'spring', stiffness: 340, damping: 18 },
            y:       { delay: delay + 0.45, duration: 3 + fi * 0.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <span style={{ color }}><Icon size={11} /></span>
          <span className={styles.floatVal} style={{ color }}>{val}</span>
          <span className={styles.floatLabel}>{label}</span>
        </motion.div>
      ))}

      {/* Glassmorphic dashboard card */}
      <motion.div
        className={styles.vizCard}
        variants={fadeRight}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {/* Card header */}
        <div className={styles.vizHeader}>
          <span className={styles.vizTitle}>Analytics Overview</span>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            Live
          </span>
        </div>

        {/* Bar chart */}
        <div className={styles.chartWrap}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H + 2}`}
            className={styles.chartSvg}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#04d06d" />
                <stop offset="100%" stopColor="#baf269" />
              </linearGradient>
            </defs>

            {/* Guide lines */}
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g}
                x1="0" y1={SVG_H - g * SVG_H}
                x2={SVG_W} y2={SVG_H - g * SVG_H}
                stroke="#3a3b3d" strokeWidth="1" strokeDasharray="3 5"
              />
            ))}
            {/* Baseline */}
            <line x1="0" y1={SVG_H} x2={SVG_W} y2={SVG_H} stroke="#3a3b3d" strokeWidth="1" />

            {/* Animated bars — grow from bottom */}
            {BARS.map((bar, bi) => {
              const h = (bar.pct / 100) * SVG_H;
              return (
                <motion.rect
                  key={bi}
                  x={bi * STEP}
                  width={BAR_W}
                  rx={4}
                  fill={bar.color ?? 'url(#peakGrad)'}
                  opacity={bar.color ? 0.82 : 1}
                  initial={{ y: SVG_H, height: 0 }}
                  animate={inView
                    ? { y: SVG_H - h, height: h }
                    : { y: SVG_H, height: 0 }
                  }
                  transition={{
                    delay: 0.48 + bi * 0.07,
                    duration: 0.68,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Metric labels */}
        <div className={styles.metricRow}>
          {[
            { l: 'Accuracy', v: '94.2%', c: '#04d06d' },
            { l: 'Recall',   v: '91.8%', c: '#4add97' },
            { l: 'F1-Score', v: '93.0%', c: '#baf269' },
          ].map(({ l, v, c }, mi) => (
            <motion.div
              key={l}
              className={styles.metricItem}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.0 + mi * 0.09, duration: 0.38 }}
            >
              <span className={styles.metricVal} style={{ color: c }}>{v}</span>
              <span className={styles.metricLabel}>{l}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Hero ─── */
export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {/* 3D canvas */}
      <div className={styles.canvas}><ParticleField /></div>

      {/* Blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        {/* ── LEFT: name & copy ── */}
        <div className={styles.left}>
          <motion.div className={styles.badge} variants={fadeLeft} initial="hidden" animate="visible" custom={0}>
            <span className={styles.dot} />
            Open to Opportunities
          </motion.div>

          <motion.h1 id="hero-heading" className={styles.name} variants={fadeLeft} initial="hidden" animate="visible" custom={1}>
            Keerthi Sagar
          </motion.h1>

          <motion.div className={styles.roleWrap} variants={fadeLeft} initial="hidden" animate="visible" custom={2}>
            <TypeAnimation
              sequence={[
                'Enterprise Analytics Manager', 2400,
                'Data Science Practitioner',    2000,
                'BI & Cloud Architect',         2000,
                'Predictive Modeling Expert',   2000,
              ]}
              repeat={Infinity}
              wrapper="span"
              className={styles.role}
              cursor
            />
          </motion.div>

          <motion.p className={styles.tagline} variants={fadeLeft} initial="hidden" animate="visible" custom={3}>
            I turn raw data into decisions that move the needle — pipelines,
            models, dashboards, and the narratives that leaders act on.
          </motion.p>

          <motion.div className={styles.ctas} variants={fadeLeft} initial="hidden" animate="visible" custom={4}>
            <button
              className="btn-primary"
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Projects <FiArrowRight />
            </button>
            <a href="mailto:keerthisagarchegondi@gmail.com" className="btn-outline">
              <FiMail /> Say Hello
            </a>
          </motion.div>

          <motion.div className={styles.socials} variants={fadeLeft} initial="hidden" animate="visible" custom={5}>
            <a
              href="https://www.linkedin.com/in/keerthisagarch"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="LinkedIn"
            >
              <FiLinkedin size={18} />
            </a>
            <a href="mailto:keerthisagarchegondi@gmail.com" className={styles.socialBtn} aria-label="Email">
              <FiMail size={18} />
            </a>
          </motion.div>
        </div>

        {/* ── RIGHT: data viz panel ── */}
        <div className={styles.right}>
          <AnalyticsCard />
        </div>
      </div>

      {/* Stat chips strip */}
      <motion.div
        className={styles.chips}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6 }}
      >
        {[
          { n: '6+', l: 'Years' },
          { n: '3',  l: 'Industries' },
          { n: 'MS', l: 'Analytics' },
        ].map(s => (
          <div key={s.l} className={styles.chip}>
            <span className={styles.chipN}>{s.n}</span>
            <span className={styles.chipL}>{s.l}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
