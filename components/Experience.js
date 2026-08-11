/**
 * Experience.js — Career timeline with one-by-one animated card reveals.
 * Features: animated timeline line draw, spring-slide-in cards, staggered
 * bullet points, pulsing dot per card, "Current" badge, role-color accents.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiMapPin, FiCalendar, FiBriefcase } from 'react-icons/fi';
import styles from './Experience.module.css';

/* ─── Role Data ─── */
const ROLES = [
  {
    title:    'Analytics Manager',
    company:  "Leslie's Pool Mart Inc.",
    period:   'Jun 2022 — Present',
    location: 'Phoenix, AZ',
    color:    '#04d06d',
    current:  true,
    points: [
      'Productionized a customer churn classification model using Scikit-learn and XGBoost, containerized in Docker with MLflow, reducing churn by 12% over six months.',
      'Designed a reusable A/B testing framework for marketing experiments, integrating statistical significance checks to sharpen budget allocation.',
      'Engineered ELT pipelines in PySpark, SQL, and dbt, orchestrating data flows through Airflow with Kafka-based event ingestion.',
      'Tuned Snowflake query performance by restructuring clustering keys, cutting execution time on high-complexity queries from 15 minutes to under 60 seconds.',
      'Partnered with cross-functional engineering teams to deploy ML predictions through FastAPI endpoints on Kubernetes.',
      'Built Power BI dashboards with DAX measures, translating predictive insights into actionable views for stakeholders.',
    ],
  },
  {
    title:    'Business Development Associate',
    company:  "Think and Learn Pvt Ltd (Byju's)",
    period:   'Sep 2019 — May 2020',
    location: 'Telangana, India',
    color:    '#4add97',
    current:  false,
    points: [
      'Built churn prediction models using app usage and campaign data, enabling marketing to prioritize high-ROI engagement strategies.',
      'Designed SQL-based dashboards consolidating funnel drop-offs, campaign-level ROI, and cohort retention views.',
      'Conducted regional-level analysis to identify where marketing spend was driving new customer acquisition versus stalling.',
      'Restructured the reporting cadence to align weekly and monthly views with leadership KPI frameworks.',
    ],
  },
  {
    title:    'Chartering & Operations Manager',
    company:  'Vedanta Limited',
    period:   'Sep 2016 — Oct 2018',
    location: 'Odisha, India',
    color:    '#baf269',
    current:  false,
    points: [
      'Developed freight cost models for chartering decisions, quantifying route selection and cycle time trade-offs used daily for allocation planning.',
      'Built operational monitoring dashboards in Power BI and Excel tracking vessel turnaround, rake utilization, and demurrage exposure.',
      'Partnered with finance on budget and ROI analysis to optimize procurement strategy.',
      'Created scenario planning tools in Excel and Python, testing different port routings and volume profiles to support logistics reviews.',
    ],
  },
];

/* ─── Variants ─── */
const cardSlide = {
  hidden:  { opacity: 0, x: -56, y: 8, scale: 0.96 },
  visible: {
    opacity: 1, x: 0, y: 0, scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const headerFade = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

const bulletStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.22 } },
};

const bulletItem = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Single experience card ─── */
function ExpCard({ role, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <div ref={ref} className={styles.row}>
      {/* Timeline column */}
      <div className={styles.timelineCol} aria-hidden="true">
        {/* Pulse dot */}
        <div
          className={`${styles.dot} ${inView ? styles.dotActive : ''}`}
          style={{ borderColor: role.color, background: inView ? role.color : 'var(--bg-surface)' }}
        >
          <span
            className={`${styles.dotRing} ${inView ? styles.dotRingActive : ''}`}
            style={{ borderColor: `${role.color}55` }}
          />
        </div>
      </div>

      {/* Content card */}
      <motion.article
        className={styles.card}
        variants={cardSlide}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{ '--role-color': role.color }}
        aria-label={`${role.title} at ${role.company}`}
      >
        {/* Left accent bar */}
        <motion.div
          className={styles.accentBar}
          style={{ background: role.color }}
          initial={{ scaleY: 0, originY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Card header */}
        <motion.div className={styles.cardHead} variants={headerFade}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{role.title}</h3>
            {role.current && (
              <motion.span
                className={styles.currentBadge}
                style={{ background: `${role.color}18`, color: role.color, borderColor: `${role.color}40` }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.35, type: 'spring', stiffness: 340, damping: 18 }}
              >
                Current
              </motion.span>
            )}
          </div>

          <motion.div className={styles.metaRow} variants={headerFade}>
            <span className={styles.company}>
              <FiBriefcase size={12} />
              {role.company}
            </span>
            <span className={styles.metaSep} aria-hidden="true">·</span>
            <span className={styles.meta}>
              <FiCalendar size={12} />
              {role.period}
            </span>
            <span className={styles.metaSep} aria-hidden="true">·</span>
            <span className={styles.meta}>
              <FiMapPin size={12} />
              {role.location}
            </span>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className={styles.divider}
          initial={{ scaleX: 0, originX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Bullet points — stagger in one by one */}
        <motion.ul
          className={styles.bullets}
          variants={bulletStagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {role.points.map((pt, pi) => (
            <motion.li key={pi} className={styles.bullet} variants={bulletItem}>
              <span className={styles.bulletDot} style={{ background: `${role.color}90` }} />
              <span>{pt}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.article>
    </div>
  );
}

/* ─── Section ─── */
export default function Experience() {
  const [hRef, hInView] = useInView({ triggerOnce: true, threshold: 0.4 });
  const lineRef   = useRef(null);
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ['start 0.85', 'end 0.3'] });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className={`section ${styles.section}`} aria-labelledby="exp-heading">
      <div className="container">
        {/* ── Header ── */}
        <div ref={hRef} className={styles.header}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -18 }}
            animate={hInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Experience
          </motion.p>
          <motion.h2
            id="exp-heading"
            className="section-heading"
            initial={{ opacity: 0, y: 22 }}
            animate={hInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Career{' '}
            <span className="gradient-text">Highlights</span>
          </motion.h2>
          <motion.p
            className="section-sub"
            initial={{ opacity: 0, y: 12 }}
            animate={hInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.22, duration: 0.5 }}
          >
            7+ years bridging analytics, operations, and enterprise strategy across three industries.
          </motion.p>
        </div>

        {/* ── Timeline ── */}
        <div ref={lineRef} className={styles.timeline}>
          {/* Scroll-driven timeline line */}
          <div className={styles.lineTrack} aria-hidden="true">
            <motion.div
              className={styles.lineFill}
              style={{ scaleY: lineScaleY, originY: 0 }}
            />
          </div>

          {/* Cards */}
          {ROLES.map((role, i) => (
            <ExpCard key={role.title} role={role} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
