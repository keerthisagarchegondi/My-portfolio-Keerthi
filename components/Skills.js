/**
 * Skills.js — Data-analytics themed skill cards.
 * Visual: animated proficiency bars, skill-count badge, featured card,
 * 3D tilt, icon bounce, tag cascade, draw-in top border, glow ring.
 */
import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiUsers, FiBarChart2, FiMonitor, FiCloud, FiCode, FiZap } from 'react-icons/fi';
import styles from './Skills.module.css';

/* ─── Skill categories with proficiency level + analytics-role context ─── */
const CATS = [
  {
    icon:     FiBarChart2,
    title:    'Data Science',
    color:    '#04d06d',
    level:    92,
    levelLabel: 'Expert',
    featured: true,
    context:  'Core practice area',
    skills:   ['Predictive Modeling', 'A/B Testing', 'CLV Analysis', 'Churn Modeling', 'NLP / BERT', 'Uplift Modeling'],
  },
  {
    icon:     FiUsers,
    title:    'Analytics Leadership',
    color:    '#4add97',
    level:    88,
    levelLabel: 'Expert',
    featured: false,
    context:  'Stakeholder & strategy',
    skills:   ['Team Management', 'Stakeholder Alignment', 'Agile Delivery', 'Executive Storytelling'],
  },
  {
    icon:     FiMonitor,
    title:    'BI & Visualization',
    color:    '#baf269',
    level:    85,
    levelLabel: 'Advanced',
    featured: false,
    context:  'From SQL to boardroom',
    skills:   ['Power BI (DAX)', 'Tableau', 'SQL Dashboards', 'KPI Frameworks'],
  },
  {
    icon:     FiCloud,
    title:    'Cloud Data',
    color:    '#02b85f',
    level:    80,
    levelLabel: 'Advanced',
    featured: false,
    context:  'Scalable pipelines',
    skills:   ['Snowflake', 'BigQuery', 'Azure', 'Microsoft Fabric', 'Data Governance'],
  },
  {
    icon:     FiCode,
    title:    'Programming',
    color:    '#4add97',
    level:    78,
    levelLabel: 'Advanced',
    featured: false,
    context:  'Analysis & modeling',
    skills:   ['SQL', 'Python', 'Pandas', 'Scikit-learn', 'R', 'Statsmodels'],
  },
];

/* ─── Variants ─── */
const gridStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden:  { opacity: 0, y: 52, scale: 0.94, rotateX: 10 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const iconVariant = {
  hidden:  { scale: 0.4, opacity: 0, rotate: -20 },
  visible: {
    scale: 1, opacity: 1, rotate: 0,
    transition: { type: 'spring', stiffness: 320, damping: 16, delay: 0.18 },
  },
};

const tagStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } },
};

const tagVariant = {
  hidden:  { opacity: 0, scale: 0.75, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Animated proficiency bar ─── */
function ProfBar({ level, color, inView }) {
  return (
    <div className={styles.barWrap} role="meter" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.barTrack}>
        <motion.div
          className={styles.barFill}
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
        {/* Shimmer sweep on the bar */}
        <motion.div
          className={styles.barShimmer}
          initial={{ x: '-100%', opacity: 0 }}
          animate={inView ? { x: '200%', opacity: [0, 0.6, 0] } : {}}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.9 }}
        />
      </div>
      <span className={styles.barPct} style={{ color }}>{level}%</span>
    </div>
  );
}

/* ─── 3D tilt card ─── */
function TiltCard({ children, className, color, inView }) {
  const ref = useRef(null);
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const rx  = useTransform(my, [-35, 35], [7, -7]);
  const ry  = useTransform(mx, [-35, 35], [-7, 7]);
  const srx = useSpring(rx, { stiffness: 280, damping: 28 });
  const sry = useSpring(ry, { stiffness: 280, damping: 28 });
  const [hov, setHov] = useState(false);

  const onMove  = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left  - r.width  / 2);
    my.set(e.clientY - r.top   - r.height / 2);
  };
  const onLeave = () => { mx.set(0); my.set(0); setHov(false); };

  return (
    <motion.div
      ref={ref}
      variants={cardVariant}
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 900 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
      animate={hov
        ? { boxShadow: `0 20px 48px ${color}28, 0 4px 16px rgba(0,0,0,0.07)`, borderColor: `${color}55` }
        : { boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderColor: 'var(--color-border)' }
      }
      transition={{ duration: 0.25 }}
    >
      {/* Animated glow ring */}
      <motion.div
        className={styles.glowRing}
        style={{ borderColor: color }}
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {children}
    </motion.div>
  );
}

/* ─── Word-split heading ─── */
const wordV = {
  hidden:  { opacity: 0, y: 28, skewY: 5 },
  visible: (i) => ({
    opacity: 1, y: 0, skewY: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};
const WORDS = ['The', 'Toolkit', 'I', 'Bring'];

export default function Skills() {
  const [hRef, hInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [gRef, gInView] = useInView({ triggerOnce: true, threshold: 0.06 });

  return (
    <section id="skills" className={`section ${styles.section}`} aria-labelledby="skills-heading">
      {/* Ambient shimmer */}
      <motion.div
        className={styles.shimmer}
        initial={{ opacity: 0 }}
        animate={hInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.4 }}
        aria-hidden="true"
      />

      <div className="container">
        {/* ── Header ── */}
        <div ref={hRef} className={styles.header}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -18 }}
            animate={hInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Skills
          </motion.p>

          <h2 id="skills-heading" className={`section-heading ${styles.heading}`}>
            {WORDS.map((w, i) => (
              <motion.span
                key={w + i}
                className={w === 'Toolkit' ? `gradient-text ${styles.headWord}` : styles.headWord}
                custom={i}
                variants={wordV}
                initial="hidden"
                animate={hInView ? 'visible' : 'hidden'}
              >
                {w}
              </motion.span>
            ))}
          </h2>

          <div className={styles.subWrap}>
            <motion.p
              className={`section-sub ${styles.sub}`}
              initial={{ opacity: 0, y: 10 }}
              animate={hInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              Full-stack analytics — from pipelines to presentations.
            </motion.p>
            <motion.div
              className={styles.subLine}
              initial={{ scaleX: 0, originX: 0 }}
              animate={hInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* ── Cards grid ── */}
        <motion.div
          ref={gRef}
          className={styles.grid}
          variants={gridStagger}
          initial="hidden"
          animate={gInView ? 'visible' : 'hidden'}
        >
          {CATS.map((cat, ci) => {
            const Icon = cat.icon;
            return (
              <TiltCard
                key={cat.title}
                className={`${styles.card} ${cat.featured ? styles.featured : ''}`}
                color={cat.color}
                inView={gInView}
              >
                {/* Draw-in top border */}
                <motion.div
                  className={styles.topBorder}
                  style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}66)` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={gInView ? { scaleX: 1 } : {}}
                  transition={{ delay: ci * 0.1 + 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Card header row */}
                <div className={styles.cardHeader}>
                  <motion.div
                    className={styles.iconBox}
                    style={{ background: `${cat.color}12`, color: cat.color }}
                    variants={iconVariant}
                    whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1, transition: { duration: 0.4 } }}
                  >
                    <Icon size={cat.featured ? 22 : 20} />
                  </motion.div>

                  {/* Skill count badge */}
                  <motion.span
                    className={styles.countBadge}
                    style={{ background: `${cat.color}10`, color: cat.color, borderColor: `${cat.color}30` }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={gInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: ci * 0.1 + 0.45, type: 'spring', stiffness: 300 }}
                  >
                    <FiZap size={10} />
                    {cat.skills.length} skills
                  </motion.span>
                </div>

                {/* Title + context */}
                <div>
                  <motion.h3
                    className={styles.cardTitle}
                    initial={{ opacity: 0, x: -12 }}
                    animate={gInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: ci * 0.1 + 0.22, duration: 0.42 }}
                  >
                    {cat.title}
                  </motion.h3>
                  <motion.p
                    className={styles.cardContext}
                    initial={{ opacity: 0 }}
                    animate={gInView ? { opacity: 1 } : {}}
                    transition={{ delay: ci * 0.1 + 0.32, duration: 0.4 }}
                  >
                    {cat.context}
                  </motion.p>
                </div>

                {/* Proficiency bar */}
                <div className={styles.profRow}>
                  <span className={styles.levelLabel} style={{ color: cat.color }}>{cat.levelLabel}</span>
                  <ProfBar level={cat.level} color={cat.color} inView={gInView} />
                </div>

                {/* Tags */}
                <motion.div className={styles.tags} variants={tagStagger} initial="hidden" animate={gInView ? 'visible' : 'hidden'}>
                  {cat.skills.map(s => (
                    <motion.span
                      key={s}
                      variants={tagVariant}
                      className={styles.tag}
                      whileHover={{
                        scale: 1.08,
                        background: `${cat.color}0F`,
                        borderColor: cat.color,
                        color: cat.color,
                        transition: { duration: 0.15 },
                      }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </motion.div>
              </TiltCard>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
